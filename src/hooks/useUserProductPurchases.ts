import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProductPurchase {
  id: string;
  user_id: string;
  product_id: string;
  purchase_source: 'amazon_affiliate' | 'manual_admin';
  purchase_price?: number;
  purchase_date: string;
  admin_notes?: string;
  verification_status: 'pending' | 'verified' | 'disputed';
  added_by_admin?: string;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    title: string;
    price: number;
    amazon_affiliate_link: string;
    product_images?: {
      image_url: string;
      is_primary: boolean;
    }[];
  };
  profiles?: {
    name: string;
  };
}

export interface CreateProductPurchaseData {
  user_id: string;
  product_id: string;
  purchase_source?: 'amazon_affiliate' | 'manual_admin';
  purchase_price?: number;
  admin_notes?: string;
  verification_status?: 'pending' | 'verified' | 'disputed';
}

// Hook to get all user product purchases (admin only)
export const useUserProductPurchases = () => {
  return useQuery({
    queryKey: ['user-product-purchases'],
    queryFn: async () => {
      console.log('Fetching user product purchases...');
      
      const { data, error } = await supabase
        .from('user_product_purchases')
        .select(`
          *,
          products!user_product_purchases_product_id_fkey (
            id,
            title,
            price,
            amazon_affiliate_link
          ),
          profiles!user_product_purchases_user_id_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user product purchases:', error);
        throw error;
      }

      console.log('Fetched user product purchases:', data);
      return data as UserProductPurchase[];
    },
  });
};

// Hook to get product purchases for a specific user
export const useUserProductPurchasesByUser = (userId?: string) => {
  return useQuery({
    queryKey: ['user-product-purchases', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching product purchases for user:', userId);
      
      const { data, error } = await supabase
        .from('user_product_purchases')
        .select(`
          *,
          products!user_product_purchases_product_id_fkey (
            id,
            title,
            price,
            amazon_affiliate_link,
            product_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching user product purchases:', error);
        throw error;
      }

      console.log('Fetched product purchases for user:', data);
      return data as UserProductPurchase[];
    },
    enabled: !!userId,
  });
};

// Hook to create a new product purchase (admin only)
export const useCreateProductPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseData: CreateProductPurchaseData) => {
      console.log('Creating product purchase:', purchaseData);
      
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Admin not authenticated');
      }

      const { data, error } = await supabase
        .from('user_product_purchases')
        .insert([{
          ...purchaseData,
          added_by_admin: user.id,
          purchase_source: purchaseData.purchase_source || 'manual_admin'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating product purchase:', error);
        throw error;
      }

      console.log('Created product purchase:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-product-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
      toast.success('Product purchase added successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to create product purchase:', error);
      toast.error(`Failed to add product purchase: ${error.message}`);
    },
  });
};

// Hook to update a product purchase
export const useUpdateProductPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateProductPurchaseData>) => {
      console.log('Updating product purchase:', id, updateData);
      
      const { data, error } = await supabase
        .from('user_product_purchases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product purchase:', error);
        throw error;
      }

      console.log('Updated product purchase:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-product-purchases'] });
      toast.success('Product purchase updated successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to update product purchase:', error);
      toast.error(`Failed to update product purchase: ${error.message}`);
    },
  });
};

// Hook to delete a product purchase
export const useDeleteProductPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting product purchase:', id);
      
      const { error } = await supabase
        .from('user_product_purchases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product purchase:', error);
        throw error;
      }

      console.log('Deleted product purchase:', id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-product-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
      toast.success('Product purchase removed successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to delete product purchase:', error);
      toast.error(`Failed to remove product purchase: ${error.message}`);
    },
  });
}; 