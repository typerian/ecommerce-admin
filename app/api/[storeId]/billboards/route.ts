import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { label, imageUrl }: { label: string; imageUrl: string } = body;

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!label) {
      return new NextResponse("La etiqueta es requerida", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("El ID de la tienda es requerida", {
        status: 400,
      });
    }

    if (!imageUrl) {
      return new NextResponse("La URL de la imagen es requerida", {
        status: 400,
      });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("No autorizado", {
        status: 400,
      });
    }

    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_POST]", error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("El ID de la tienda es requerida", {
        status: 400,
      });
    }

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.log("[BILLBOARDS_GET]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
