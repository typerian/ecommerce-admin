import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("El ID de la categoria es requerida", {
        status: 400,
      });
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("CATEGORY_GET");
    return new NextResponse("Error interno", { status: 500 });
  }
}

export const PATCH = async (
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) => {
  try {
    const body = await req.json();
    const { name, billboardId }: { name: string; billboardId: string } = body;
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!name) {
      return new NextResponse("El nombre de la categoria es requerido", {
        status: 400,
      });
    }
    if (!billboardId) {
      return new NextResponse("El id de la cartelera es requerido", {
        status: 400,
      });
    }

    if (!params.categoryId) {
      return new NextResponse("El ID de la categoria es requerido", {
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
      return new NextResponse("No autorizado [SIN TIENDA]", {
        status: 403,
      });
    }

    const categoria = await prismadb.category.updateMany({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        billboardId,
      },
    });

    return NextResponse.json(categoria);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!params.categoryId) {
      return new NextResponse("El ID de la categoria es requerido", {
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
      return new NextResponse("No autorizado [SIN TIENDA]", {
        status: 403,
      });
    }

    const category = await prismadb.category.deleteMany({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
};
