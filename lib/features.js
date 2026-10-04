import {
  Image as ImageIcon, ScanText, Type, Receipt, ListChecks, RectangleHorizontal,
  StickyNote, FileText, NotebookPen, Globe, Printer, Star, Heart, Tag, Bookmark, Zap,
} from "lucide-react";

export const ICON_MAP = { Type, Star, Heart, Tag, Bookmark, Zap };

// kind: "picture" | "text" | "soon" | "test"
export const FEATURES = [
  { id: "picture", icon: ImageIcon, kind: "picture" },
  { id: "text", icon: Type, kind: "text", preset: { size: 32, bold: true, textCase: "none", align: "center" } },
  { id: "banner", icon: RectangleHorizontal, kind: "text", preset: { size: 72, bold: true, textCase: "upper", align: "center" } },
  { id: "todo", icon: ListChecks, kind: "text", prefix: "[ ] ", preset: { size: 28, bold: false, textCase: "none", align: "left" } },
  { id: "sticky", icon: StickyNote, kind: "text", preset: { size: 30, bold: true, textCase: "none", align: "center", border: true } },
  { id: "notes", icon: NotebookPen, kind: "text", preset: { size: 24, bold: false, textCase: "none", align: "left" } },
  { id: "slip", icon: Receipt, kind: "text", dateHeader: true, preset: { font: "Courier New", size: 24, bold: false, textCase: "none", align: "left" } },
  { id: "scan", icon: ScanText, kind: "soon" },
  { id: "document", icon: FileText, kind: "soon" },
  { id: "website", icon: Globe, kind: "soon" },
  { id: "test", icon: Printer, kind: "test" },
];

// built-in + admin er banano custom button mile final list
export function buildTools(settings, t) {
  const hidden = settings.hiddenTools || [];
  const labels = settings.labels || {};
  const list = [];
  FEATURES.forEach((f) => {
    if (hidden.includes(f.id)) return;
    list.push({
      ...f,
      title: labels[f.id] || t("f." + f.id + ".title"),
      desc: t("f." + f.id + ".desc"),
      steps: t("f." + f.id + ".steps"),
    });
  });
  (settings.customButtons || []).forEach((b) => {
    if (hidden.includes(b.id)) return;
    list.push({
      id: b.id,
      kind: "text",
      icon: ICON_MAP[b.icon] || Type,
      title: labels[b.id] || b.title,
      desc: b.desc,
      steps: [t("custom.s1"), t("custom.s2")],
      preset: { size: b.size, bold: b.bold, textCase: b.textCase, align: b.align, border: b.border },
    });
  });
  return list;
}
