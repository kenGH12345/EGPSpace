import { EditorShell } from '@/components/editor/EditorShell';

export const metadata = {
  title: 'EGPSpace 实验编辑器',
  description: '拖放元件、点击连线、一键运行的交互式实验搭建器。',
};

export default function EditorPage() {
  return <EditorShell initialDomain="circuit" />;
}
