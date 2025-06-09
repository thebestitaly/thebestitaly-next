"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import LanguageSwitcher from "../../components/widgets/LanguageSwitcher";
import { getTranslations } from "../../lib/directus";

const Footer: React.FC = () => {
 const params = useParams();
 const pathname = usePathname();
 const lang = (params?.lang as string) || "it";

 // Funzione per determinare se siamo in una pagina destination e il suo tipo
 const getDestinationInfo = () => {
   const pathParts = pathname.split("/").filter(Boolean);
   
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

 // Query per ottenere le traduzioni del footer
 const { data: footerTranslations, isLoading: isLoadingFooter, error: footerError } = useQuery({
   queryKey: ["footer-translations", lang],
   queryFn: () => getTranslations(lang, "footer"),
 });

 // Query per ottenere le traduzioni del menu
 const { data: menuTranslations, isLoading: isLoadingMenu, error: menuError } = useQuery({
   queryKey: ["menu-translations", lang],
   queryFn: () => getTranslations(lang, "menu"),
 });

 if (isLoadingFooter || isLoadingMenu) return <div>Loading...</div>;
 if (footerError || menuError) {
   console.error("Footer Error:", footerError);
   console.error("Menu Error:", menuError);
   return <div>Error loading translations</div>;
 }

 // Funzione per determinare se mostrare il language switcher
 const shouldShowLanguageSwitcher = () => {
   const pathSegments = pathname.split('/').filter(Boolean);
   // Mostra sempre lo switcher se siamo in homepage o pagine statiche
   if (pathSegments.length <= 2) return true;  // copre /, /it, /it/experience, ecc.
   
   // Per magazine e destinazioni
   if (pathSegments.length >= 3) {
     const [, pageType] = pathSegments;
     return ["magazine", "region", "province", "municipality"].includes(pageType);
   }
   
   return false;
 };

 return (
   <footer className="bg-gray-800 text-white py-12">
     <div className="container mx-auto px-4">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div>
           <h3 className="text-xl font-bold mb-4">TheBestItaly</h3>
           <p className="text-gray-300">
             {footerTranslations?.description || "Default footer description"}
           </p>
           <p className="text-gray-300">
             {footerTranslations?.subtitle || "Default footer description"}
           </p>
         </div>

         <div>
           <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
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

         <div>
           <h4 className="text-lg font-semibold mb-4">Contact</h4>
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
           type={type}
         />
       </div>
     )}
   </footer>
 );
};

export default Footer;