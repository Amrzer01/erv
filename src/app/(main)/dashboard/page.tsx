import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>المهام</CardTitle>
          <CardDescription>إدارة متابعة وتنفيذ المهام اليومية</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">قريباً</p>
        </CardContent>
      </Card>
    </div>
  );
}
