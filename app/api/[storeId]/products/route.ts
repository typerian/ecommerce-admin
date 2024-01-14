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

    const producto = await prismadb.product.create({
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        storeId: params.storeId,
      },
    });

    if (producto) {
      for (let index = 0; index < images.length; index++) {
        const element = images[index];

        await prismadb.image.create({
          data: {
            productId: producto.id,
            url: element.url,
          },
        });
      }
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.log("[PRODUCT_POST]", error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId) {
      return new NextResponse("El ID de la tienda es requerida", {
        status: 400,
      });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
