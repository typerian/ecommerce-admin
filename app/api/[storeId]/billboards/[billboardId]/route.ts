import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      return new NextResponse("El ID de la cartelera es requerida", {
        status: 400,
      });
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("BILLBOARD_GET");
    return new NextResponse("Error interno", { status: 500 });
  }
}

export const PATCH = async (
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) => {
  try {
    const body = await req.json();
    const { label, imageUrl }: { label: string; imageUrl: string } = body;
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!label) {
      return new NextResponse("La etiqueta es requerido", {
        status: 400,
      });
    }
    if (!imageUrl) {
      return new NextResponse("La URL de la imagen es requerido", {
        status: 400,
      });
    }

    if (!params.billboardId) {
      return new NextResponse("El ID de la cartelera es requerido", {
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

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: params.billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) => {
  console.log({ "PARAMETROS DE RUTA": params });
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!params.billboardId) {
      return new NextResponse("El ID de la tienda es requerido", {
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

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
};
