"use client";

import { useEffect, useState } from "react";

import { Key, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getPermissions } from "../_actions/roles";

export function PermissionsTab() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    const result = await getPermissions();
    if (result.success && result.data) {
      setPermissions(result.data);
    }
    setLoading(false);
  };

  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      const category = perm.category || "عام";
      if (!acc[category]) acc[category] = [];
      acc[category].push(perm);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>دليل الصلاحيات</CardTitle>
        </CardHeader>
      </Card>

      {Object.keys(groupedPermissions).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">لا توجد صلاحيات</CardContent>
        </Card>
      ) : (
        Object.entries(groupedPermissions).map(([category, perms]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {perms.map((perm) => (
                  <div key={perm.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Key className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{perm.display_name}</div>
                        <div className="text-sm text-muted-foreground">{perm.permission_key}</div>
                      </div>
                    </div>
                    {perm.description && (
                      <div className="text-sm text-muted-foreground text-left">{perm.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
