import {
  Image as ImageIcon, ScanText, Type, Receipt, ListChecks, RectangleHorizontal,
  StickyNote, FileText, NotebookPen, Globe, Printer,
} from "lucide-react";

// kind: "picture" | "text" | "soon"
// preset: text panel er default setting
export const FEATURES = [
  {
    id: "picture", title: "Picture Print", icon: ImageIcon, kind: "picture",
    desc: "Gallery theke chobi niye black & white e print koro.",
    steps: ["Chobi select koro", "Preview dekho", "Print press koro"],
  },
  {
    id: "text", title: "Text", icon: Type, kind: "text",
    desc: "Lekha likhe font, size ar small/capital letter choose kore print koro.",
    steps: ["Lekha likho", "Font ar letter style choose koro", "Preview dekhe Print koro"],
    preset: { size: 32, bold: true, textCase: "none", align: "center" },
  },
  {
    id: "banner", title: "Banner", icon: RectangleHorizontal, kind: "text",
    desc: "Boro boro akkhore banner print koro.",
    steps: ["Chhoto lekha likho", "Print koro"],
    preset: { size: 72, bold: true, textCase: "upper", align: "center" },
  },
  {
    id: "todo", title: "Todo", icon: ListChecks, kind: "text", prefix: "[ ] ",
    desc: "Prottek line ekta checkbox shoho todo list hishebe print hobe.",
    steps: ["Prottek line e ekta kaj likho", "Print koro, tarpor tick dao"],
    preset: { size: 28, bold: false, textCase: "none", align: "left" },
  },
  {
    id: "sticky", title: "Sticky Note", icon: StickyNote, kind: "text",
    desc: "Border shoho chhoto note print koro.",
    steps: ["Note likho", "Print kore kothao sagiye dao"],
    preset: { size: 30, bold: true, textCase: "none", align: "center", border: true },
  },
  {
    id: "notes", title: "Notes", icon: NotebookPen, kind: "text",
    desc: "Lomba note likhe print koro.",
    steps: ["Note likho", "Print koro"],
    preset: { size: 24, bold: false, textCase: "none", align: "left" },
  },
  {
    id: "slip", title: "New Slip", icon: Receipt, kind: "text", dateHeader: true,
    desc: "Tarikh shoho receipt style slip print koro.",
    steps: ["Slip er lekha likho", "Print koro, upore tarikh thakbe"],
    preset: { font: "Courier New", size: 24, bold: false, textCase: "none", align: "left" },
  },
  {
    id: "scan", title: "Text Scan", icon: ScanText, kind: "soon",
    desc: "Camera diye lekha scan kore print korar feature. Shighroi ashche.",
    steps: [],
  },
  {
    id: "document", title: "Document", icon: FileText, kind: "soon",
    desc: "Document file print korar feature. Shighroi ashche.",
    steps: [],
  },
  {
    id: "website", title: "Website", icon: Globe, kind: "soon",
    desc: "Website er page print korar feature. Shighroi ashche.",
    steps: [],
  },
  {
    id: "test", title: "Test Print", icon: Printer, kind: "test",
    desc: "Printer thik kaj korche kina ekta chhoto test page print kore dekho.",
    steps: ["Printer connect koro", "Continue press koro"],
  },
];
