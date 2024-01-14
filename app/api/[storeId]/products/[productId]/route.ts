import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("El ID del producto es requerida", {
        status: 400,
      });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
        category: true,
        size: true,
        color: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("PRODUCT_GET");
    return new NextResponse("Error interno", { status: 500 });
  }
}

export const PATCH = async (
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) => {
  try {
    const body = await req.json();
    const {
      name,
      price,
      categoryId,
      colorId,
      sizeId,
      images,
      isFeatured,
      isArchived,
    }: {
      name: string;
      price: string;
      categoryId: string;
      colorId: string;
      sizeId: string;
      images: { url: string }[];
      isFeatured: boolean;
      isArchived: boolean;
    } = body;
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!name) {
      return new NextResponse("El nombre del producto es requerida", {
        status: 400,
      });
    }
    if (!price) {
      return new NextResponse("El precio del producto es requerida", {
        status: 400,
      });
    }
    if (!categoryId) {
      return new NextResponse(
        "El id de la categoria del producto es requerida",
        { status: 400 }
      );
    }
    if (!colorId) {
      return new NextResponse("El id del color del producto es requerida", {
        status: 400,
      });
    }
    if (!sizeId) {
      return new NextResponse("El id de la talla del producto es requerida", {
        status: 400,
      });
    }

    if (!images || !images.length) {
      return new NextResponse("Las o la imagen del producto es requerida", {
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

    const product = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        images: {
          deleteMany: {},
        },
        isFeatured,
        isArchived,
      },
    });

    if (params.productId) {
      for (let index = 0; index < images.length; index++) {
        const element = images[index];

        await prismadb.image.create({
          data: {
            productId: params.productId,
            url: element.url,
          },
        });
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) => {
  console.log(params);
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("No autenticado", { status: 401 });
    }

    if (!params.productId) {
      return new NextResponse("El ID del PRODUCTO es requerido", {
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

    const imagesToDelete = await prismadb.image.findMany({
      where: {
        productId: params.productId,
      },
    });

    for (const image of imagesToDelete) {
      await prismadb.image.delete({
        where: {
          id: image.id,
        },
      });
    }

    // Now delete the Product record itself
    const product = await prismadb.product.delete({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Error interno al tratar de eliminar el producto", {
      status: 500,
    });
  }
};
