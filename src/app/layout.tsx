import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eureka - AI 驱动的无限画布知识搜索与可视化管理',
  description: 'Eureka 是一个 AI 驱动的无限画布知识探索引擎，将知识可视化为交互式图谱',
  keywords: ['知识图谱', 'AI', '无限画布', '可视化', '知识探索'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
