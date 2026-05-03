import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';
import { ExperimentSchema } from '@/lib/experiment-schema';
import { useRouter } from 'next/navigation';

export function AIGeneratorDialog() {
  const [open, setOpen] = useState(false);
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!concept.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, stage: 'junior' }),
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || '生成失败');
      }

      // 如果后端返回了合法的 templateId，我们跳转过去并可以在 sessionStorage 传参，或者如果是拓扑直接带过去。
      // 这里为演示简单处理：跳转到一个通用的加载页面或者如果匹配到 templateId 就进入
      const schema: ExperimentSchema = data.schema;
      const tId = data.templateId || 'generic';
      
      // 我们将生成的 Schema 存入 sessionStorage 供渲染页提取使用
      sessionStorage.setItem('eureka_experiment_config', JSON.stringify(schema));
      // 兼容可能遗漏修改的内部组件，保留旧键名
      sessionStorage.setItem('ai-generated-schema', JSON.stringify(schema));
      
      setOpen(false);
      
      // 简单模拟路由跳转到通用的实验沙盒 (如果是新拓扑或机制可以跳转)
      // 如果后端没返回 templateId 而是纯组件组装模型，可以重定向到 editor
      if (schema.components && schema.components.length > 0) {
        // 如果是组装实验，带上参数去 editor 看看
        router.push('/editor');
      } else {
        router.push(`/experiments/${encodeURIComponent(tId)}?ai=true`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
          <Sparkles className="w-4 h-4" />
          AI 生成实验
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI 实验生成助手</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            输入您想设计的实验概念或组装需求（例如：“设计一个灯泡和电池的串联电路” 或 “量子纠缠现象”）。
          </p>
          <Textarea
            placeholder="请输入实验概念..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            disabled={loading}
            className="min-h-[100px]"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleGenerate} disabled={loading || !concept.trim()} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? '正在生成...' : '立即生成'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
