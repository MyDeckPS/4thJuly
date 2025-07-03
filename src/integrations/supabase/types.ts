export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_images: {
        Row: {
          alt_text: string | null
          blog_id: string
          created_at: string | null
          id: string
          image_url: string
        }
        Insert: {
          alt_text?: string | null
          blog_id: string
          created_at?: string | null
          id?: string
          image_url: string
        }
        Update: {
          alt_text?: string | null
          blog_id?: string
          created_at?: string | null
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_images_diary_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string | null
          excerpt: string | null
          hero_image: string
          id: string
          meta_description: string | null
          meta_title: string | null
          publish_date: string | null
          published: boolean | null
          read_time: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          hero_image: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          publish_date?: string | null
          published?: boolean | null
          read_time: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          hero_image?: string
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          publish_date?: string | null
          published?: boolean | null
          read_time?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount_paid: number | null
          booking_status: string | null
          created_at: string | null
          end_time: string
          host_notes: string | null
          id: string
          meeting_link: string | null
          payment_id: string | null
          payment_status: string | null
          rescheduled_from: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          special_notes: string | null
          start_time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          booking_status?: string | null
          created_at?: string | null
          end_time: string
          host_notes?: string | null
          id?: string
          meeting_link?: string | null
          payment_id?: string | null
          payment_status?: string | null
          rescheduled_from?: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          special_notes?: string | null
          start_time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          booking_status?: string | null
          created_at?: string | null
          end_time?: string
          host_notes?: string | null
          id?: string
          meeting_link?: string | null
          payment_id?: string | null
          payment_status?: string | null
          rescheduled_from?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          special_notes?: string | null
          start_time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      branding_settings: {
        Row: {
          created_at: string
          favicon_url: string | null
          id: string
          platform_logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          favicon_url?: string | null
          id?: string
          platform_logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          favicon_url?: string | null
          id?: string
          platform_logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      child_insights: {
        Row: {
          cognitive_score: number | null
          created_at: string
          creativity_imagination_score: number | null
          id: string
          month_1_score: number | null
          month_10_score: number | null
          month_11_score: number | null
          month_12_score: number | null
          month_2_score: number | null
          month_3_score: number | null
          month_4_score: number | null
          month_5_score: number | null
          month_6_score: number | null
          month_7_score: number | null
          month_8_score: number | null
          month_9_score: number | null
          motor_skill_score: number | null
          stem_robotics_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cognitive_score?: number | null
          created_at?: string
          creativity_imagination_score?: number | null
          id?: string
          month_1_score?: number | null
          month_10_score?: number | null
          month_11_score?: number | null
          month_12_score?: number | null
          month_2_score?: number | null
          month_3_score?: number | null
          month_4_score?: number | null
          month_5_score?: number | null
          month_6_score?: number | null
          month_7_score?: number | null
          month_8_score?: number | null
          month_9_score?: number | null
          motor_skill_score?: number | null
          stem_robotics_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cognitive_score?: number | null
          created_at?: string
          creativity_imagination_score?: number | null
          id?: string
          month_1_score?: number | null
          month_10_score?: number | null
          month_11_score?: number | null
          month_12_score?: number | null
          month_2_score?: number | null
          month_3_score?: number | null
          month_4_score?: number | null
          month_5_score?: number | null
          month_6_score?: number | null
          month_7_score?: number | null
          month_8_score?: number | null
          month_9_score?: number | null
          motor_skill_score?: number | null
          stem_robotics_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      collection_links: {
        Row: {
          created_at: string
          id: string
          linked_collection_id: string
          parent_collection_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_collection_id: string
          parent_collection_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_collection_id?: string
          parent_collection_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_links_linked_collection_id_fkey"
            columns: ["linked_collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_links_parent_collection_id_fkey"
            columns: ["parent_collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          published: boolean
          sort_order: number
          tags: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          published?: boolean
          sort_order?: number
          tags?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          published?: boolean
          sort_order?: number
          tags?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      collections_display: {
        Row: {
          collection_id: string
          created_at: string
          display_type: string
          id: string
          is_active: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          display_type: string
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          display_type?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_display_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      community_notes: {
        Row: {
          content: string
          created_at: string
          featured: boolean
          id: string
          images: string[] | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["note_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          featured?: boolean
          id?: string
          images?: string[] | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["note_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          featured?: boolean
          id?: string
          images?: string[] | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["note_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      developmental_goals: {
        Row: {
          color: string
          created_at: string
          emoji: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          emoji?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          emoji?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      developmental_levels: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      dynamic_pages: {
        Row: {
          body: string
          created_at: string
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      expert_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      footer_configurations: {
        Row: {
          column_title: string
          created_at: string
          id: string
          is_active: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          column_title: string
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          column_title?: string
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          created_at: string
          external_url: string | null
          footer_column_id: string
          id: string
          is_active: boolean
          link_category: string | null
          link_type: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_url?: string | null
          footer_column_id: string
          id?: string
          is_active?: boolean
          link_category?: string | null
          link_type: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_url?: string | null
          footer_column_id?: string
          id?: string
          is_active?: boolean
          link_category?: string | null
          link_type?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "footer_links_footer_column_id_fkey"
            columns: ["footer_column_id"]
            isOneToOne: false
            referencedRelation: "footer_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      host: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          profile_image_url: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          profile_image_url?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          profile_image_url?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          created_at: string
          file_size: number | null
          file_type: string
          file_url: string
          filename: string
          id: string
          original_filename: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_size?: number | null
          file_type: string
          file_url: string
          filename: string
          id?: string
          original_filename: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          filename?: string
          id?: string
          original_filename?: string
          updated_at?: string
        }
        Relationships: []
      }
      note_likes: {
        Row: {
          created_at: string
          note_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          note_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          note_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_likes_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "community_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          order_number: string
          payment_id: string | null
          payment_status: string
          shipping_address_id: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_number: string
          payment_id?: string | null
          payment_status?: string
          shipping_address_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_number?: string
          payment_id?: string | null
          payment_status?: string
          shipping_address_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      playpath_sessions: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          session_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          session_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          session_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playpath_sessions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      product_accordions: {
        Row: {
          content: string
          created_at: string
          id: string
          product_id: string
          sort_order: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_accordions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_carousels: {
        Row: {
          collection_id: string | null
          created_at: string
          description: string | null
          filter_type: string
          id: string
          is_active: boolean
          product_ids: Json | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          description?: string | null
          filter_type: string
          id?: string
          is_active?: boolean
          product_ids?: Json | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          description?: string | null
          filter_type?: string
          id?: string
          is_active?: boolean
          product_ids?: Json | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_carousels_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collections: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          product_id: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          age_group: string
          amazon_affiliate_link: string
          compare_at_price: number | null
          created_at: string
          days_to_complete: number | null
          description: string
          developmental_level_id: string
          featured: boolean
          has_cognitive_development: boolean | null
          has_creativity_imagination: boolean | null
          has_motor_skills: boolean | null
          has_stem_robotics: boolean | null
          id: string
          price: number | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          published: boolean
          stock_quantity: number | null
          stock_status: Database["public"]["Enums"]["stock_status"] | null
          tags: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          age_group: string
          amazon_affiliate_link: string
          compare_at_price?: number | null
          created_at?: string
          days_to_complete?: number | null
          description: string
          developmental_level_id: string
          featured?: boolean
          has_cognitive_development?: boolean | null
          has_creativity_imagination?: boolean | null
          has_motor_skills?: boolean | null
          has_stem_robotics?: boolean | null
          id?: string
          price?: number | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          published?: boolean
          stock_quantity?: number | null
          stock_status?: Database["public"]["Enums"]["stock_status"] | null
          tags?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          age_group?: string
          amazon_affiliate_link?: string
          compare_at_price?: number | null
          created_at?: string
          days_to_complete?: number | null
          description?: string
          developmental_level_id?: string
          featured?: boolean
          has_cognitive_development?: boolean | null
          has_creativity_imagination?: boolean | null
          has_motor_skills?: boolean | null
          has_stem_robotics?: boolean | null
          id?: string
          price?: number | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          published?: boolean
          stock_quantity?: number | null
          stock_status?: Database["public"]["Enums"]["stock_status"] | null
          tags?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_developmental_level_id_fkey"
            columns: ["developmental_level_id"]
            isOneToOne: false
            referencedRelation: "developmental_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          quiz_completed: boolean
          updated_at: string
          welcome_offer_used: boolean
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          quiz_completed?: boolean
          updated_at?: string
          welcome_offer_used?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          quiz_completed?: boolean
          updated_at?: string
          welcome_offer_used?: boolean
        }
        Relationships: []
      }
      question_tagging_rules: {
        Row: {
          confidence_score: number
          created_at: string
          id: string
          option_value: string
          question_id: string
          tag_to_assign: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          id?: string
          option_value: string
          question_id: string
          tag_to_assign: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          id?: string
          option_value?: string
          question_id?: string
          tag_to_assign?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_tagging_rules_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          is_required: boolean | null
          options: Json | null
          question: string
          question_key: string
          question_type: string
          required: boolean
          set_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          question: string
          question_key: string
          question_type: string
          required?: boolean
          set_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          question?: string
          question_key?: string
          question_type?: string
          required?: boolean
          set_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "quiz_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          completed_at: string
          id: string
          responses: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          responses?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          responses?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_sets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string
          note_type: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          note_type?: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          note_type?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_notes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "sales_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          id: string
          payment_gateway_data: Json | null
          payment_gateway_id: string | null
          payment_status: string
          sales_id: string
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          id?: string
          payment_gateway_data?: Json | null
          payment_gateway_id?: string | null
          payment_status?: string
          sales_id: string
          source_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          payment_gateway_data?: Json | null
          payment_gateway_id?: string | null
          payment_status?: string
          sales_id?: string
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_rules: {
        Row: {
          buffer_minutes: number
          created_at: string | null
          id: string
          max_booking_days: number
          min_notice_hours: number
          slot_duration_minutes: number
          updated_at: string | null
        }
        Insert: {
          buffer_minutes?: number
          created_at?: string | null
          id?: string
          max_booking_days?: number
          min_notice_hours?: number
          slot_duration_minutes?: number
          updated_at?: string | null
        }
        Update: {
          buffer_minutes?: number
          created_at?: string | null
          id?: string
          max_booking_days?: number
          min_notice_hours?: number
          slot_duration_minutes?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      session_configurations: {
        Row: {
          created_at: string | null
          description: string
          duration_minutes: number
          id: string
          is_active: boolean
          price: number
          session_type: Database["public"]["Enums"]["session_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          duration_minutes: number
          id?: string
          is_active?: boolean
          price: number
          session_type: Database["public"]["Enums"]["session_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          price?: number
          session_type?: Database["public"]["Enums"]["session_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      session_pricing_configurations: {
        Row: {
          base_price: number
          compare_at_price: number | null
          created_at: string
          id: string
          is_active: boolean
          session_type: Database["public"]["Enums"]["session_type"]
          updated_at: string
          user_type: string
          welcome_price: number | null
        }
        Insert: {
          base_price?: number
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          session_type: Database["public"]["Enums"]["session_type"]
          updated_at?: string
          user_type: string
          welcome_price?: number | null
        }
        Update: {
          base_price?: number
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          session_type?: Database["public"]["Enums"]["session_type"]
          updated_at?: string
          user_type?: string
          welcome_price?: number | null
        }
        Relationships: []
      }
      shipping_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          phone: string | null
          postal_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string | null
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_sections: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          section_type: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_type: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_type?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shop_slideshows: {
        Row: {
          created_at: string
          id: string
          internal_path: string | null
          is_active: boolean
          link_type: string | null
          link_url: string | null
          media_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          internal_path?: string | null
          is_active?: boolean
          link_type?: string | null
          link_url?: string | null
          media_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_path?: string | null
          is_active?: boolean
          link_type?: string | null
          link_url?: string | null
          media_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_slideshows_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recommendations: {
        Row: {
          admin_opinion: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          product_id: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          admin_opinion?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id: string
          sort_order?: number | null
          user_id: string
        }
        Update: {
          admin_opinion?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tags: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          metadata: Json | null
          source_question_id: string | null
          tag: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source_question_id?: string | null
          tag: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source_question_id?: string | null
          tag?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tags_source_question_id_fkey"
            columns: ["source_question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      working_hours: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_link_products_by_tags: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_session_price: {
        Args:
          | {
              p_user_id: string
              p_session_type: Database["public"]["Enums"]["session_type"]
            }
          | { p_user_id: string; p_session_type: string }
        Returns: number
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_sales_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_time_slots_for_next_30_days: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_available_dates: {
        Args: {
          session_type_param: Database["public"]["Enums"]["session_type"]
          days_ahead?: number
        }
        Returns: {
          available_date: string
        }[]
      }
      get_available_slots: {
        Args: {
          target_date: string
          session_type_param: Database["public"]["Enums"]["session_type"]
        }
        Returns: {
          start_time: string
          end_time: string
        }[]
      }
      get_playpath_usage: {
        Args: { user_id: string }
        Returns: {
          used_sessions: number
          total_free_sessions: number
        }[]
      }
      get_user_email: {
        Args: { user_uuid: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      process_quiz_tags: {
        Args: { p_user_id: string; p_responses: Json }
        Returns: undefined
      }
      validate_quiz_responses: {
        Args: { p_responses: Json }
        Returns: {
          is_valid: boolean
          missing_questions: string[]
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      note_status: "pending" | "approved" | "rejected"
      product_type: "affiliate" | "buyable"
      session_type: "playpath" | "consultation"
      stock_status: "in_stock" | "out_of_stock"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
      note_status: ["pending", "approved", "rejected"],
      product_type: ["affiliate", "buyable"],
      session_type: ["playpath", "consultation"],
      stock_status: ["in_stock", "out_of_stock"],
    },
  },
} as const
