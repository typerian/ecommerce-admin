import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { sizeId: string } }
) {
  try {
    if (!params.sizeId) {
      return new NextResponse("El ID de la cartelera es requerida", {
        status: 400,
      });
    }

    const size = await prismadb.size.findUnique({
      where: {
        id: params.sizeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("SIZE_GET");
    return new NextResponse("Error interno", { status: 500 });
  }
}

export const PATCH = async (
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) => {
  try {
    const body = await req.json();
    const { name, value }: { name: string; value: string } = body;
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!name) {
      return new NextResponse("El nombre de la talla es requerido", {
        status: 400,
      });
    }
    if (!value) {
      return new NextResponse("El valor de la talla es requerido", {
        status: 400,
      });
    }

    if (!params.sizeId) {
      return new NextResponse("El ID de la talla es requerido", {
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

    const size = await prismadb.size.updateMany({
      where: {
        id: params.sizeId,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_PATCH]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) => {
  console.log({ "PARAMETROS DE RUTA": params });
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!params.sizeId) {
      return new NextResponse("El ID de la talla es requerido", {
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

    const size = await prismadb.size.deleteMany({
      where: {
        id: params.sizeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_DELETE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
};
