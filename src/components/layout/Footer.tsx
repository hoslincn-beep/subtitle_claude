interface FooterProps {
  t?: Record<string, any>;
}

export function Footer({ t }: FooterProps) {
  const texts = (t as any)?.footer || {
    copyright: "© 2026 SubExtract. 保留所有权利.",
    terms: "使用条款",
    privacy: "隐私政策",
    contact: "联系我们",
  };

  const supportedPlatforms = [
    "YouTube",
    "Bilibili",
    "Viki",
    "Dailymotion",
    "iQiyi",
    "WeTV",
    "Hotstar",
    "Viu",
  ];

  return (
    <footer className="border-t border-warm-border bg-white mt-20">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-xs">
                SE
              </div>
              <span className="font-semibold">SubExtract</span>
            </div>
            <p className="text-sm text-warm-muted leading-relaxed">
              从 YouTube、Bilibili 等 50+ 视频平台提取多语言字幕，支持 SRT、VTT、ASS、TXT、HTML 格式下载。
            </p>
          </div>

          {/* Supported platforms */}
          <div>
            <h4 className="font-medium text-sm mb-3 text-warm-text">支持平台</h4>
            <ul className="grid grid-cols-2 gap-1">
              {supportedPlatforms.map((p) => (
                <li key={p} className="text-sm text-warm-muted">
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-sm mb-3 text-warm-text">链接</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-warm-muted hover:text-warm-orange transition-colors">
                  {texts.terms}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-warm-muted hover:text-warm-orange transition-colors">
                  {texts.privacy}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-warm-muted hover:text-warm-orange transition-colors">
                  {texts.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-warm-border pt-6 text-center text-sm text-warm-muted">
          {texts.copyright}
        </div>
      </div>
    </footer>
  );
}
