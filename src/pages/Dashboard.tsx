import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookmarkCheck, Building2, GraduationCap } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
];

export default function Dashboard() {
  const { data: students = [] } = useQuery({
    queryKey: ['dashboard-students'],
    queryFn: async () => {
      const { data } = await supabase.from('student_contacts').select('preferred_countries, preferred_domains');
      return data || [];
    },
  });

  const { data: savedCourses = [] } = useQuery({
    queryKey: ['dashboard-saved'],
    queryFn: async () => {
      const { data } = await supabase.from('saved_courses').select('id, eligibility_status, course_id');
      return data || [];
    },
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['dashboard-universities'],
    queryFn: async () => {
      const { data } = await supabase.from('universities').select('id');
      return data || [];
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['dashboard-courses'],
    queryFn: async () => {
      const { data } = await supabase.from('courses').select('id, name');
      return data || [];
    },
  });

  // Country preferences
  const countryMap: Record<string, number> = {};
  students.forEach((s) => {
    (s.preferred_countries || []).forEach((c: string) => {
      countryMap[c] = (countryMap[c] || 0) + 1;
    });
  });
  const countryData = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Domain preferences
  const domainMap: Record<string, number> = {};
  students.forEach((s) => {
    (s.preferred_domains || []).forEach((d: string) => {
      domainMap[d] = (domainMap[d] || 0) + 1;
    });
  });
  const domainData = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Eligibility distribution
  const eligMap: Record<string, number> = { Eligible: 0, Borderline: 0, 'Not Eligible': 0 };
  savedCourses.forEach((sc) => {
    const status = sc.eligibility_status || 'Not Eligible';
    if (status.toLowerCase().includes('eligible') && !status.toLowerCase().includes('not')) {
      eligMap['Eligible']++;
    } else if (status.toLowerCase().includes('borderline') || status.toLowerCase().includes('partial')) {
      eligMap['Borderline']++;
    } else {
      eligMap['Not Eligible']++;
    }
  });
  const eligData = Object.entries(eligMap)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Top courses
  const courseCountMap: Record<string, number> = {};
  savedCourses.forEach((sc) => {
    courseCountMap[sc.course_id] = (courseCountMap[sc.course_id] || 0) + 1;
  });
  const courseNameMap = Object.fromEntries(courses.map((c) => [c.id, c.name]));
  const topCourses = Object.entries(courseCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count]) => ({ name: (courseNameMap[id] || 'Unknown').slice(0, 30), count }));

  const countryConfig: ChartConfig = { count: { label: 'Students', color: 'hsl(var(--primary))' } };
  const domainConfig: ChartConfig = { count: { label: 'Students', color: 'hsl(var(--primary))' } };
  const topCoursesConfig: ChartConfig = { count: { label: 'Saves', color: 'hsl(var(--primary))' } };
  const eligConfig: ChartConfig = {
    Eligible: { label: 'Eligible', color: COLORS[1] },
    Borderline: { label: 'Borderline', color: COLORS[2] },
    'Not Eligible': { label: 'Not Eligible', color: COLORS[4] },
  };

  const metrics = [
    { label: 'Total Students', value: students.length, icon: Users },
    { label: 'Saved Courses', value: savedCourses.length, icon: BookmarkCheck },
    { label: 'Universities', value: universities.length, icon: Building2 },
    { label: 'Courses', value: courses.length, icon: GraduationCap },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/80 backdrop-blur px-6 py-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{m.value}</p>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Country preferences */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Country Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {countryData.length > 0 ? (
                <ChartContainer config={countryConfig} className="h-[260px] w-full">
                  <BarChart data={countryData} layout="vertical" margin={{ left: 80, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={75} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Domain preferences */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Domain Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {domainData.length > 0 ? (
                <ChartContainer config={domainConfig} className="h-[260px] w-full">
                  <BarChart data={domainData} layout="vertical" margin={{ left: 100, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={95} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Top saved courses */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Saved Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {topCourses.length > 0 ? (
                <ChartContainer config={topCoursesConfig} className="h-[260px] w-full">
                  <BarChart data={topCourses} layout="vertical" margin={{ left: 120, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={115} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Eligibility distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Eligibility Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {eligData.length > 0 ? (
                <ChartContainer config={eligConfig} className="h-[260px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={eligData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {eligData.map((entry, i) => (
                        <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
