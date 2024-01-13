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
    const { name, billboardId }: { name: string; billboardId: string } = body;

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Nombre de la categoria es requerida", {
        status: 400,
      });
    }

    if (!billboardId) {
      return new NextResponse("El Id de la cartelera es requerida", {
        status: 400,
      });
    }

    if (!params.storeId) {
      return new NextResponse("El ID de la tienda es requerida", {
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

    const category = await prismadb.category.create({
      data: {
        name,
        billboardId,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORIES _POST]", error);
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

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
