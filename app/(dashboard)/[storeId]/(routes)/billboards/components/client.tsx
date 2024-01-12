"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Billboard } from "@prisma/client";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { BillboardColumn } from "./columns";

interface BillboardClientProps {
  data: BillboardColumn[];
}

const BillboardClient: React.FC<BillboardClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  console.log(data);
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Carteleras (${data.length})`}
          description="Gestiona carteleras para tu tienda"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/billboards/new`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Añadir Nueva
        </Button>
      </div>
      <Separator />
    </>
  );
};

export default BillboardClient;
