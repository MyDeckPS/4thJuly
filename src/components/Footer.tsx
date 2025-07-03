import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useFooterLinks } from "@/hooks/useFooterLinks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const {
    data: footerLinks = []
  } = useFooterLinks();

  // Get footer columns separately to structure the data properly
  const {
    data: footerColumns = []
  } = useQuery({
    queryKey: ["footer-columns"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("footer_configurations").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data || [];
    }
  });

  // Group footer links by their column ID
  const linksByColumn = footerLinks.reduce((acc: {
    [key: string]: any[];
  }, link: any) => {
    const columnId = link.footer_column_id;
    if (columnId && link.link_category === 'footer') {
      if (!acc[columnId]) {
        acc[columnId] = [];
      }
      acc[columnId].push(link);
    }
    return acc;
  }, {});

  // Sort links within each column by sort_order
  Object.keys(linksByColumn).forEach(columnId => {
    linksByColumn[columnId].sort((a: any, b: any) => a.sort_order - b.sort_order);
  });

  return (
    <footer className="bg-[#FB5607] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="inline-block bg-white rounded-2xl p-3 shadow-md">
              <img src="/MD.png" alt="MyDeck Club Logo" className="h-12" />
            </div>
            <p className="text-warm-peach leading-relaxed">
              Empowering children's development through expert guidance and personalized learning experiences.
            </p>
          </div>

          {/* Dynamic Footer Columns */}
          {footerColumns.map((column: any) => (
            <div key={column.id} className="space-y-4">
              <h4 className="text-lg font-semibold">{column.column_title}</h4>
              <ul className="space-y-2">
                {linksByColumn[column.id]?.map((link: any) => (
                  <li key={link.id}>
                    {link.external_url?.startsWith('/') ? (
                      <Link 
                        to={link.external_url} 
                        className="text-warm-peach hover:text-white transition-colors text-sm hover:cursor-pointer"
                      >
                        {link.title}
                      </Link>
                    ) : (
                      <a 
                        href={link.external_url} 
                        className="text-warm-peach hover:text-white transition-colors text-sm hover:cursor-pointer"
                      >
                        {link.title}
                      </a>
                    )}
                  </li>
                )) || (
                  <li className="text-warm-peach text-sm">No links added yet</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-warm-sage/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-warm-peach text-sm">
            © 2024 MyDeck Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
