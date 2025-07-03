import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
interface ProgressGraphProps {
  monthlyData: Array<{
    month: string;
    score: number;
  }>;
  isPremiumUser: boolean;
}
const ProgressGraph = ({
  monthlyData,
  isPremiumUser
}: ProgressGraphProps) => {
  return <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>Overall Developmental Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`${!isPremiumUser ? 'filter blur-sm' : ''}`}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-sm text-muted-foreground" />
                <YAxis hide />
                <Area type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={3} fill="url(#progressGradient)" dot={{
                fill: '#8884d8',
                strokeWidth: 2,
                r: 4
              }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {!isPremiumUser && <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Get membership to track your child's progress</p>
              <Button asChild>
                <Link to="/membership">Get Membership</Link>
              </Button>
            </div>
          </div>}
      </CardContent>
    </Card>;
};
export default ProgressGraph;