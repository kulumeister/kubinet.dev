import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Gizli bir API token kullanarak güvenliği sağla
const API_TOKEN = process.env.REVALIDATE_TOKEN || "gizli-token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, path } = body;

    // Token kontrolü yap
    if (token !== API_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Belirtilen path'i veya tüm sayfaları yeniden oluştur
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    } else {
      // Eğer belirli bir path belirtilmezse, ana sayfaları yenile
      revalidatePath("/");
      revalidatePath("/blog");
      return NextResponse.json({ revalidated: true, paths: ["/", "/blog"] });
    }
  } catch (error) {
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
} 