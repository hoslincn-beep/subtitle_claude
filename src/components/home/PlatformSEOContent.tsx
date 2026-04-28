"use client";

import { UrlInput } from "./UrlInput";
import { CheckCircle, Download, Zap, Globe } from "lucide-react";

interface PlatformSEOContentProps {
  info: {
    name: string;
    title: string;
    description: string;
  };
}

const features = [
  { icon: Download, title: "多格式支持", desc: "SRT、VTT、TXT、ASS、HTML 格式随心选择" },
  { icon: Globe, title: "多语言字幕", desc: "自动检测平台多语言字幕和自动翻译字幕" },
  { icon: Zap, title: "双语字幕", desc: "支持两种语言字幕合并下载，方便语言学习" },
  { icon: CheckCircle, title: "CC 字幕识别", desc: "智能区分CC字幕、自动生成字幕和翻译字幕" },
];

export function PlatformSEOContent({ info }: PlatformSEOContentProps) {
  return (
    <div className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-warm-text mb-4">
          {info.name} 字幕下载器
        </h1>
        <p className="text-warm-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          {info.description}
        </p>
      </div>

      <UrlInput
        onAnalyze={(url) => {
          window.location.href = `/?url=${encodeURIComponent(url)}`;
        }}
        isLoading={false}
        placeholder={`粘贴 ${info.name} 视频链接...`}
      />

      <div className="mx-auto max-w-3xl mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <div key={i} className="rounded-2xl border border-warm-border bg-white p-5 shadow-subtle text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-warm-accent mb-3">
              <feature.icon className="h-5 w-5 text-warm-orange" />
            </div>
            <h3 className="font-semibold text-warm-text mb-1.5">{feature.title}</h3>
            <p className="text-xs text-warm-muted">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-2xl mt-16">
        <h2 className="text-xl font-bold text-warm-text text-center mb-8">常见问题</h2>
        <div className="space-y-3">
          {[
            { q: `如何在 ${info.name} 下载字幕？`, a: "只需粘贴视频链接到输入框，点击开始分析，系统会自动检测可用字幕。选择您需要的语言和格式，点击下载按钮即可获取字幕文件。" },
            { q: "支持哪些字幕格式？", a: "支持 SRT（最常用）、VTT（Web标准）、ASS（高级样式）、TXT（纯文本）和 HTML（网页格式）五种格式。" },
            { q: "可以下载双语字幕吗？", a: "可以！在字幕列表下方的双语字幕区域，选择两种语言即可生成并下载合并后的双语字幕文件。" },
            { q: "下载需要付费吗？", a: "完全免费。SubExtract 是免费的在线工具，无需注册或付费。" },
          ].map((faq, i) => (
            <details key={i} className="group rounded-xl border border-warm-border bg-white shadow-subtle">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-warm-text">
                {faq.q}
                <span className="text-warm-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-warm-muted leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
