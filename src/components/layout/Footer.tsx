"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import directusClient from "@/lib/directus";
import LanguageSwitcher from "../../components/widgets/LanguageSwitcher";
import { useSectionTranslations } from '@/hooks/useTranslations';

const Footer: React.FC = () => {
 const params = useParams();
 const pathname = usePathname();
 const lang = (params?.lang as string) || "it";

 // Query per ottenere le regioni
 const { data: regions } = useQuery({
   queryKey: ['regions-footer', lang],
   queryFn: () => directusClient.getDestinationsByType('region', lang),
 });

 // Query per ottenere le categorie del magazine
 const { data: categories } = useQuery({
   queryKey: ['categories-footer', lang],
   queryFn: () => directusClient.getCategories(lang),
 });

 // Funzione per determinare se siamo in una pagina destination e il suo tipo
 const getDestinationInfo = () => {
   const pathParts = pathname?.split("/").filter(Boolean) || [];
   
   if (pathParts.includes('region')) {
     return { isDestination: true, type: 'region' };
   }
   if (pathParts.includes('province')) {
     return { isDestination: true, type: 'province' };
   }
   if (pathParts.includes('municipality')) {
     return { isDestination: true, type: 'municipality' };
   }

   return { isDestination: false, type: null };
 };

 const { isDestination, type } = getDestinationInfo();

 // Hook per le traduzioni con il nuovo sistema
 const { translations: footerTranslations, loading: isLoadingFooter } = useSectionTranslations('footer', lang);
 const { translations: menuTranslations, loading: isLoadingMenu } = useSectionTranslations('menu', lang);

 if (isLoadingFooter || isLoadingMenu) return <div>Loading...</div>;

 // Funzione per determinare se mostrare il language switcher
 const shouldShowLanguageSwitcher = () => {
   if (!pathname) return false;
   const pathSegments = pathname.split('/').filter(Boolean);
   // Mostra sempre lo switcher se siamo in homepage o pagine statiche
   if (pathSegments.length <= 2) return true;  // copre /, /it, /it/experience, ecc.
   
   // Per magazine, destinazioni E POI (eccellenze)
   if (pathSegments.length >= 3) {
     const [, pageType] = pathSegments;
     return ["magazine", "region", "province", "municipality", "poi"].includes(pageType);
   }
   
   return false;
 };

 // Dividi le regioni in due colonne
 const regionsColumn1 = regions?.slice(0, Math.ceil((regions?.length || 0) / 2)) || [];
 const regionsColumn2 = regions?.slice(Math.ceil((regions?.length || 0) / 2)) || [];

 return (
   <footer className="bg-gray-800 text-white py-12">
     <div className="container mx-auto px-4">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {/* Prima colonna: TheBestItaly + Regioni */}
         <div>
           <p className="text-xl font-bold mb-4">TheBestItaly</p>
           
           {/* Regioni in due colonne */}
           <div className="grid grid-cols-2 gap-2">
             <div>
               {regionsColumn1.map((region) => {
                 const translation = region.translations?.[0];
                 if (!translation?.slug_permalink) return null;
                 return (
                   <Link
                     key={region.id}
                     href={`/${lang}/${translation.slug_permalink}`}
                     className="block text-sm text-gray-300 hover:text-white transition-colors duration-200 mb-1"
                   >
                     {translation.destination_name}
                   </Link>
                 );
               })}
             </div>
             <div>
               {regionsColumn2.map((region) => {
                 const translation = region.translations?.[0];
                 if (!translation?.slug_permalink) return null;
                 return (
                   <Link
                     key={region.id}
                     href={`/${lang}/${translation.slug_permalink}`}
                     className="block text-sm text-gray-300 hover:text-white transition-colors duration-200 mb-1"
                   >
                     {translation.destination_name}
                   </Link>
                 );
               })}
             </div>
           </div>
         </div>

         {/* Seconda colonna: Categorie Magazine */}
         <div>
           <div className="text-lg font-semibold mb-4">Magazine</div>
           <ul className="space-y-2">
             {categories?.map((category) => {
               const translation = category.translations?.[0];
               if (!translation?.slug_permalink) return null;
               return (
                 <li key={category.id}>
                   <Link
                     href={`/${lang}/magazine/c/${translation.slug_permalink}`}
                     className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                   >
                     {translation.nome_categoria}
                   </Link>
                 </li>
               );
             })}
           </ul>
         </div>

         {/* Terza colonna: Quick Links */}
         <div>
           <div className="text-lg font-semibold mb-4">Quick Links</div>
           <ul className="space-y-2">
             <li>
               <Link
                 href={`/${lang}/`}
                 className="text-gray-300 hover:text-white transition-colors duration-200"
               >
                 {menuTranslations?.home || "Home"}
               </Link>
             </li>
             <li>
               <Link
                 href={`/${lang}/magazine`}
                 className="text-gray-300 hover:text-white transition-colors duration-200"
               >
                 {menuTranslations?.magazine || "Magazine"}
               </Link>
             </li>
             <li>
               <Link
                 href={`/${lang}/experience`}
                 className="text-gray-300 hover:text-white transition-colors duration-200"
               >
                 {menuTranslations?.experience || "Experience"}
               </Link>
             </li>
           </ul>
         </div>

         {/* Quarta colonna: Legal */}
         <div>
           <div className="text-lg font-semibold mb-4">Legal</div>
           <ul className="space-y-2 text-gray-300">
             <li>
               <Link
                 href="https://www.iubenda.com/privacy-policy/85025242"
                 className="hover:text-white transition-colors duration-200"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 Privacy Policy
               </Link>
             </li>
             <li>
               <Link
                 href="https://www.iubenda.com/privacy-policy/85025242/cookie-policy"
                 className="hover:text-white transition-colors duration-200"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 Cookie Policy
               </Link>
             </li>
             <li>
               <Link
                 href="https://www.iubenda.com/termini-e-condizioni/85025242"
                 className="hover:text-white transition-colors duration-200"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 Termini e Condizioni
               </Link>
             </li>
           </ul>
         </div>
       </div>

       <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
         <p>
           &copy; {new Date().getFullYear()} TheBestItaly.{" "}
           {footerTranslations?.copyright || "Default footer description"}.
         </p>
       </div>
     </div>

     {shouldShowLanguageSwitcher() && (
       <div className="mt-12 pt-8 border-t border-gray-700">
         <LanguageSwitcher 
           isDestination={isDestination} 
           type={type as "region" | "province" | "municipality" | null}
         />
       </div>
     )}
   </footer>
 );
};

export default Footer;