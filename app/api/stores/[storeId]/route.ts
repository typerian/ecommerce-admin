import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  console.log({ "PARAMETROS DE RUTA": params });

  try {
    const body = await req.json();
    const { name } = body;
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!name) {
      return new NextResponse("El Nombre de la tienda es requerido", {
        status: 400,
      });
    }

    if (!params.storeId) {
      return new NextResponse("El ID de la tienda es requerido", {
        status: 400,
      });
    }

    const store = await prismadb.store.updateMany({
      where: {
        id: params.storeId,
        userId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_PATCH]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  console.log({ "PARAMETROS DE RUTA": params });
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("El ID de la tienda es requerido", {
        status: 400,
      });
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_DELETE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
};
