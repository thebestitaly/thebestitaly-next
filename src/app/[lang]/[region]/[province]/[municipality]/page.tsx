"use client";

import { use, useEffect, useState } from "react";
import DestinationLayout from "@/components/destinations/DestinationLayout";
import directusClient from "@/lib/directus";

export default function MunicipalityPage({ params: paramsPromise }) {
  const params = use(paramsPromise); // Sblocca i params dalla Promise

  const [provinceId, setProvinceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvinceId = async () => {
      try {
        const destination = await directusClient.getDestinationBySlug(params.municipality, params.lang);
        if (destination && destination.province_id) {
          setProvinceId(destination.province_id);
        }
      } catch (error) {
        console.error("Error fetching province_id:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinceId();
  }, [params.municipality, params.lang]);

  if (loading) return <div>Loading...</div>;

  return (
    <DestinationLayout
      slug={params.municipality}
      lang={params.lang}
      provinceId={provinceId}  // Passa il province_id corretto
      type="municipality"
      parentSlug={params.province}
    />
  );
}