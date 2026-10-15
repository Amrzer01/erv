"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaims } from "@/lib/supabase/proxy";

export async function assignEmployeeToPotentialClient(potentialClientId: string, employeeId: string) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "غير مصرح" };
  }

  try {
    // Verify employee is active
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, status")
      .eq("id", employeeId)
      .eq("status", "active")
      .single();

    if (employeeError || !employee) {
      return { error: "الموظف غير موجود أو غير نشط" };
    }

    // Update potential client with assignment
    const { error: updateError } = await supabase
      .from("potential_clients")
      .update({
        assigned_employee_id: employeeId,
        takeover_state: "ASSIGNED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", potentialClientId);

    if (updateError) throw updateError;

    // Get potential client details for notification
    const { data: potentialClient } = await supabase
      .from("potential_clients")
      .select("phone, customer_name")
      .eq("id", potentialClientId)
      .single();

    // Create notification for assigned employee
    if (potentialClient) {
      await supabase.from("notifications").insert({
        employee_id: employeeId,
        type: "assignment",
        title: "طلب متابعة جديد",
        message: `تم تعيينك لمتابعة العميل ${potentialClient.customer_name || potentialClient.phone}`,
        phone: potentialClient.phone,
        potential_client_id: potentialClientId,
        created_at: new Date().toISOString(),
      });
    }

    revalidatePath("/dashboard/follow-up");
    return { success: true };
  } catch (error) {
    console.error("Error assigning employee:", error);
    return { error: "فشل تعيين الموظف" };
  }
}

export async function takeOverConversation(potentialClientId: string, employeeId: string) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "غير مصرح" };
  }

  try {
    // Check if already taken over
    const { data: potentialClient } = await supabase
      .from("potential_clients")
      .select("takeover_state, takeover_employee_id, takeover_timestamp")
      .eq("id", potentialClientId)
      .single();

    if (!potentialClient) {
      return { error: "العميل المحتمل غير موجود" };
    }

    if (potentialClient.takeover_state === "HUMAN_ACTIVE" && potentialClient.takeover_employee_id) {
      return { 
        error: "المحادثة قيد الاستخدام بالفعل",
        currentOwner: potentialClient.takeover_employee_id 
      };
    }

    // Use atomic update to prevent race conditions
    const { error: updateError } = await supabase
      .from("potential_clients")
      .update({
        takeover_state: "HUMAN_ACTIVE",
        takeover_employee_id: employeeId,
        takeover_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", potentialClientId)
      .neq("takeover_state", "HUMAN_ACTIVE"); // Only update if not already HUMAN_ACTIVE

    if (updateError) {
      // Check if it was a race condition
      const { data: current } = await supabase
        .from("potential_clients")
        .select("takeover_employee_id")
        .eq("id", potentialClientId)
        .single();
      
      if (current?.takeover_employee_id && current.takeover_employee_id !== employeeId) {
        return { 
          error: "المحادثة قيد الاستخدام بالفعل",
          currentOwner: current.takeover_employee_id 
        };
      }
      throw updateError;
    }

    revalidatePath("/dashboard/follow-up");
    return { success: true };
  } catch (error) {
    console.error("Error taking over conversation:", error);
    return { error: "فشل الاستيلاء على المحادثة" };
  }
}

export async function releaseTakeover(potentialClientId: string, employeeId: string) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "غير مصرح" };
  }

  try {
    const { error } = await supabase
      .from("potential_clients")
      .update({
        takeover_state: "ASSIGNED",
        takeover_released_by: employeeId,
        takeover_released_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", potentialClientId)
      .eq("takeover_employee_id", employeeId);

    if (error) throw error;

    revalidatePath("/dashboard/follow-up");
    return { success: true };
  } catch (error) {
    console.error("Error releasing takeover:", error);
    return { error: "فشل إصدار المحادثة" };
  }
}

export async function sendEmployeeMessage(potentialClientId: string, message: string, employeeId: string) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims) {
    return { error: "غير مصرح" };
  }

  try {
    // Get potential client details
    const { data: potentialClient } = await supabase
      .from("potential_clients")
      .select("phone, whatsapp_account_id, takeover_state, takeover_employee_id")
      .eq("id", potentialClientId)
      .single();

    if (!potentialClient) {
      return { error: "العميل المحتمل غير موجود" };
    }

    // Auto-assign and take over on first message
    if (potentialClient.takeover_state !== "HUMAN_ACTIVE") {
      const { error: assignError } = await supabase
        .from("potential_clients")
        .update({
          takeover_state: "HUMAN_ACTIVE",
          takeover_employee_id: employeeId,
          takeover_timestamp: new Date().toISOString(),
          assigned_employee_id: employeeId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", potentialClientId)
        .neq("takeover_state", "HUMAN_ACTIVE");

      if (assignError) {
        console.error("Assign error:", assignError);
      }
    }

    // Simple bot API call
    const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3001";
    
    if (!potentialClient.whatsapp_account_id) {
      console.log("No WhatsApp account, skipping bot call");
      revalidatePath("/dashboard/follow-up");
      return { success: true };
    }
    
    try {
      const response = await fetch(`${BOT_API_URL}/api/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: potentialClient.phone,
          message,
          employeeId,
          whatsappAccountId: potentialClient.whatsapp_account_id,
        }),
      });

      const text = await response.text();
      console.log("Bot response:", text);
      
      if (!response.ok) {
        console.error("Bot API error:", text);
      } else {
        // Persist message to database
        try {
          const { error: insertError } = await supabase
            .from("conversation_messages")
            .insert({
              phone: potentialClient.phone,
              whatsapp_account_id: potentialClient.whatsapp_account_id,
              direction: "outgoing",
              sender_type: "employee",
              employee_id: employeeId,
              message_type: "text",
              message_text: message,
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Failed to persist message:", insertError);
          }
        } catch (persistError) {
          console.error("Error persisting message:", persistError);
        }
      }
    } catch (fetchError) {
      console.error("Bot API fetch error:", fetchError);
    }

    revalidatePath("/dashboard/follow-up");
    return { success: true };
  } catch (error) {
    console.error("Error sending employee message:", error);
    return { error: error instanceof Error ? error.message : "فشل إرسال الرسالة" };
  }
}

export async function convertPotentialClientToClient(potentialClientId: string, employeeId: string, bookingData: any) {
  const supabase = await createClient();
  const claims = await getClaims();

  if (!claims && !employeeId) {
    return { error: "غير مصرح" };
  }

  try {
    // Get potential client
    const { data: potentialClient } = await supabase
      .from("potential_clients")
      .select("*")
      .eq("id", potentialClientId)
      .single();

    if (!potentialClient) {
      return { error: "العميل المحتمل غير موجود" };
    }

    // Check if client already exists
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("phone", potentialClient.phone)
      .maybeSingle();

    if (existingClient) {
      return { error: "العميل موجود بالفعل" };
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create client record
    const { error: clientError } = await supabase
      .from("clients")
      .insert({
        ticket_number: ticketNumber,
        customer_name: bookingData.customer_name || potentialClient.customer_name,
        phone: potentialClient.phone,
        booking_category: bookingData.booking_category || potentialClient.booking_category,
        passengers: bookingData.passengers || potentialClient.expected_passengers,
        room_details: bookingData.room_details || "",
        total_price: bookingData.total_price || 0,
        trip_date: bookingData.trip_date || potentialClient.expected_trip_date,
        trip_end_date: bookingData.trip_end_date || null,
        meeting_place: bookingData.meeting_place || "مسجد قباء",
        ticket_issue_date: new Date().toISOString().split('T')[0],
        status: "مكتمل",
        notes: bookingData.notes || "",
        created_at: new Date().toISOString(),
      });

    if (clientError) throw clientError;

    // Update potential client as converted
    const { error: updateError } = await supabase
      .from("potential_clients")
      .update({
        status: "converted",
        takeover_state: "COMPLETED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", potentialClientId);

    if (updateError) throw updateError;

    // Close related follow-ups
    await supabase
      .from("customer_followups")
      .update({ status: "completed" })
      .eq("phone", potentialClient.phone);

    // Close related service requests
    await supabase
      .from("customer_service_requests")
      .update({ status: "closed", resolved_at: new Date().toISOString() })
      .eq("phone", potentialClient.phone);

    revalidatePath("/dashboard/follow-up");
    revalidatePath("/dashboard/clients");
    return { success: true, ticketNumber };
  } catch (error) {
    console.error("Error converting to client:", error);
    return { error: "فشل تحويل العميل" };
  }
}

export async function getActiveEmployee(phone: string) {
  const supabase = await createClient();

  try {
    // Get random active employee
    const { data: employees } = await supabase
      .from("employees")
      .select("id, full_name")
      .eq("status", "active")
      .limit(10);

    if (!employees || employees.length === 0) {
      return null;
    }

    // Return random employee
    const randomIndex = Math.floor(Math.random() * employees.length);
    return employees[randomIndex];
  } catch (error) {
    console.error("Error getting active employee:", error);
    return null;
  }
}

export async function getNotifications(employeeId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string, employeeId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("employee_id", employeeId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { error: "فشل تحديث الإشعار" };
  }
}

export async function getConversationMessages(phone: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    return [];
  }
}
