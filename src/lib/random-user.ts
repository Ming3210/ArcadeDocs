// Danh sách màu con trỏ nổi bật, dễ nhìn
export const USER_COLORS = [
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#0ea5e9", // Sky
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#e11d48", // Crimson
  "#84cc16", // Lime
];

const ANIMAL_NAMES = [
  "Cáo Nhanh Trí",
  "Gấu Trúc Tinh Nghịch",
  "Sư Tử Dũng Mãnh",
  "Chim Cánh Cụt Đáng Yêu",
  "Đại Bàng Tinh Anh",
  "Hươu Cao Cổ",
  "Sói Tuyết Hoang Dã",
  "Hổ Vằn Thông Thái",
  "Cá Heo Thân Thiện",
  "Sóc Nhỏ Nhanh Nhẹn",
];

export interface DocUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  accountCode?: string;
}

export function getRandomUser(customId?: string): DocUser {
  const id = customId || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : "usr_" + Math.random().toString(36).slice(2, 10));
  const name = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)] + " #" + Math.floor(100 + Math.random() * 900);
  const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
  return { id, name, color, avatar };
}
