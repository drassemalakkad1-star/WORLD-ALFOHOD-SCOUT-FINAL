import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <SiteLayout>
      <div className="min-h-[80vh] w-full flex items-center justify-center bg-muted/10">
        <Card className="w-full max-w-md mx-4 border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-4xl font-black text-primary mb-4">٤٠٤ - الصفحة غير موجودة</h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              عذراً، يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
            </p>
            <Button asChild size="lg" className="rounded-xl font-bold bg-secondary hover:bg-secondary/90 text-white w-full">
              <Link href="/">
                العودة للرئيسية
                <ArrowRight className="mr-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}

