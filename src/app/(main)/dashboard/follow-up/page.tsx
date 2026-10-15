"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";

import { assignEmployeeToPotentialClient } from "./_actions/follow-ups";
import { AnalyticsCharts } from "./_components/analytics-charts";
import { CustomerDetailsDrawer } from "./_components/customer-details-drawer";
import { CustomerServiceQueue } from "./_components/customer-service-queue";
import { KpiCards } from "./_components/kpi-cards";
import { LiveConversation } from "./_components/live-conversation";
import { MasterTimeline } from "./_components/master-timeline";
import { PageHeader } from "./_components/page-header";
import { PotentialClientsCards } from "./_components/potential-clients-cards";
import { TodaysWorkKanban } from "./_components/todays-work-kanban";
import type {
  Client,
  CustomerFollowUp,
  CustomerServiceRequest,
  Employee,
  KpiData,
  PotentialClient,
  TimelineItem,
} from "./_components/types";
import { calculateKpiData, getTimelineGroups, groupByKanbanStatus } from "./_components/utils";

export default function FollowUpPage() {
  const { currentEmployee } = useAuth();
  const [potentialClients, setPotentialClients] = useState<PotentialClient[]>([]);
  const [followUps, setFollowUps] = useState<CustomerFollowUp[]>([]);
  const [serviceRequests, setServiceRequests] = useState<CustomerServiceRequest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kpiData, setKpiData] = useState<KpiData>({
    potentialClients: 0,
    scheduledFollowUps: 0,
    openHumanRequests: 0,
    todaysFollowUps: 0,
    messagesSentToday: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullscreenChatOpen, setFullscreenChatOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPotentialClient, setSelectedPotentialClient] = useState<PotentialClient | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [potentialClientsRes, followUpsRes, serviceRequestsRes, clientsRes, employeesRes] = await Promise.all([
        supabase.from("potential_clients").select("*").order("created_at", { ascending: false }),
        supabase.from("customer_followups").select("*").order("scheduled_for", { ascending: true }),
        supabase.from("customer_service_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("employees").select("*").eq("status", "active"),
      ]);

      if (potentialClientsRes.error) throw potentialClientsRes.error;
      if (followUpsRes.error) throw followUpsRes.error;
      if (serviceRequestsRes.error) throw serviceRequestsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (employeesRes.error) throw employeesRes.error;

      setPotentialClients(potentialClientsRes.data || []);
      setFollowUps(followUpsRes.data || []);
      setServiceRequests(serviceRequestsRes.data || []);
      setClients(clientsRes.data || []);
      setEmployees(employeesRes.data || []);

      setKpiData(
        calculateKpiData(potentialClientsRes.data || [], followUpsRes.data || [], serviceRequestsRes.data || []),
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();

    // Realtime subscriptions
    const potentialClientsChannel = supabase
      .channel("potential_clients_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "potential_clients" }, () => {
        fetchData();
      })
      .subscribe();

    const followUpsChannel = supabase
      .channel("customer_followups_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_followups" }, () => {
        fetchData();
      })
      .subscribe();

    const serviceRequestsChannel = supabase
      .channel("customer_service_requests_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_service_requests" }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      potentialClientsChannel.unsubscribe();
      followUpsChannel.unsubscribe();
      serviceRequestsChannel.unsubscribe();
    };
  }, []);

  const handleTimelineItemClick = (item: TimelineItem) => {
    const client = clients.find((c) => c.ticket_number === item.ticketNumber);
    const potentialClient = potentialClients.find((pc) => pc.phone === item.phone);

    setSelectedClient(client || null);
    setSelectedPotentialClient(potentialClient || null);
    setDrawerOpen(true);
  };

  const handleKanbanItemClick = (followUp: CustomerFollowUp) => {
    const client = clients.find((c) => c.ticket_number === followUp.ticket_number);
    const potentialClient = potentialClients.find((pc) => pc.phone === followUp.phone);

    setSelectedClient(client || null);
    setSelectedPotentialClient(potentialClient || null);
    setDrawerOpen(true);
  };

  const handleMarkCompleted = async (followUp: CustomerFollowUp) => {
    try {
      const { error } = await supabase.from("customer_followups").update({ status: "completed" }).eq("id", followUp.id);

      if (error) throw error;
      toast.success("تم تحديث الحالة");
    } catch (error) {
      console.error("Error updating follow-up:", error);
      toast.error("فشل تحديث الحالة");
    }
  };

  const handleRetry = async (followUp: CustomerFollowUp) => {
    try {
      const { error } = await supabase.from("customer_followups").update({ status: "pending" }).eq("id", followUp.id);

      if (error) throw error;
      toast.success("تم إعادة المحاولة");
    } catch (error) {
      console.error("Error retrying follow-up:", error);
      toast.error("فشل إعادة المحاولة");
    }
  };

  const handleOpenLead = (potentialClient: PotentialClient) => {
    setSelectedPotentialClient(potentialClient);
    setSelectedClient(null);
    setDrawerOpen(true);
  };

  const handleOpenServiceRequest = (request: CustomerServiceRequest) => {
    // Find the potential client associated with this request
    const client = potentialClients.find(pc => pc.phone === request.phone);
    if (client) {
      setSelectedPotentialClient(client);
      setFullscreenChatOpen(true);
    } else {
      toast.error("لم يتم العثور على العميل المحتمل");
    }
  };

  const timelineGroups = getTimelineGroups(followUps);

  return (
    <div className="flex flex-col gap-6 p-4">
      <PageHeader />
      <KpiCards kpiData={kpiData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <MasterTimeline timelineGroups={timelineGroups} loading={loading} onItemClick={handleTimelineItemClick} />
          <TodaysWorkKanban
            followUps={followUps}
            loading={loading}
            onItemClick={handleKanbanItemClick}
            onMarkCompleted={handleMarkCompleted}
            onRetry={handleRetry}
          />
        </div>
        <div className="space-y-6">
          <CustomerServiceQueue
            requests={serviceRequests}
            employees={employees}
            loading={loading}
            onOpen={handleOpenServiceRequest}
          />
          <PotentialClientsCards
            clients={potentialClients.filter((pc) => pc.status !== "converted")}
            loading={loading}
            onOpenLead={handleOpenLead}
          />
        </div>
      </div>

      <AnalyticsCharts
        followUps={followUps}
        serviceRequests={serviceRequests}
        potentialClients={potentialClients}
        loading={loading}
      />

      {/* Customer Details Drawer */}
      <CustomerDetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        client={selectedClient}
        potentialClient={selectedPotentialClient}
        followUps={followUps.filter(
          (fu) =>
            fu.phone === selectedClient?.phone ||
            fu.phone === selectedPotentialClient?.phone
        )}
        serviceRequests={serviceRequests.filter(
          (sr) =>
            sr.phone === selectedClient?.phone ||
            sr.phone === selectedPotentialClient?.phone
        )}
        employees={employees}
      />

      {/* Fullscreen Chat */}
      {fullscreenChatOpen && selectedPotentialClient && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="border-b p-4 flex items-center justify-between bg-background">
            <h2 className="text-xl font-semibold">المحادثة الحية</h2>
            <Button onClick={() => setFullscreenChatOpen(false)} variant="outline">
              إغلاق
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <LiveConversation potentialClient={selectedPotentialClient} employees={employees} />
          </div>
        </div>
      )}
    </div>
  );
}
