export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'finished'
  | 'postponed'
  | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          points: number;
          is_banned: boolean;
          banned_until: string | null;
          banned_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          points?: number;
          is_banned?: boolean;
          banned_until?: string | null;
          banned_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          points?: number;
          is_banned?: boolean;
          banned_until?: string | null;
          banned_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          external_id: string;
          name: string;
          short_name: string | null;
          crest_url: string | null;
          is_home_club: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id: string;
          name: string;
          short_name?: string | null;
          crest_url?: string | null;
          is_home_club?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string;
          name?: string;
          short_name?: string | null;
          crest_url?: string | null;
          is_home_club?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          external_id: string;
          competition: string;
          season: string;
          matchday: number | null;
          kickoff_at: string;
          status: MatchStatus;
          home_team_id: string;
          away_team_id: string;
          home_score: number | null;
          away_score: number | null;
          venue: string | null;
          lineups: Json | null;
          events: Json | null;
          synced_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id: string;
          competition: string;
          season: string;
          matchday?: number | null;
          kickoff_at: string;
          status?: MatchStatus;
          home_team_id: string;
          away_team_id: string;
          home_score?: number | null;
          away_score?: number | null;
          venue?: string | null;
          lineups?: Json | null;
          events?: Json | null;
          synced_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string;
          competition?: string;
          season?: string;
          matchday?: number | null;
          kickoff_at?: string;
          status?: MatchStatus;
          home_team_id?: string;
          away_team_id?: string;
          home_score?: number | null;
          away_score?: number | null;
          venue?: string | null;
          lineups?: Json | null;
          events?: Json | null;
          synced_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          id: string;
          external_id: string;
          team_id: string | null;
          full_name: string;
          known_as: string | null;
          field_position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | null;
          shirt_number: number | null;
          nationality: string | null;
          birth_date: string | null;
          photo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id: string;
          team_id?: string | null;
          full_name: string;
          known_as?: string | null;
          field_position?: 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | null;
          shirt_number?: number | null;
          nationality?: string | null;
          birth_date?: string | null;
          photo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string;
          team_id?: string | null;
          full_name?: string;
          known_as?: string | null;
          field_position?: 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | null;
          shirt_number?: number | null;
          nationality?: string | null;
          birth_date?: string | null;
          photo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      standings: {
        Row: {
          id: string;
          competition: string;
          season: string;
          team_id: string;
          table_position: number;
          played: number;
          won: number;
          drawn: number;
          lost: number;
          goals_for: number;
          goals_against: number;
          points: number;
          synced_at: string;
        };
        Insert: {
          id?: string;
          competition: string;
          season: string;
          team_id: string;
          table_position: number;
          played?: number;
          won?: number;
          drawn?: number;
          lost?: number;
          goals_for?: number;
          goals_against?: number;
          points?: number;
          synced_at?: string;
        };
        Update: {
          id?: string;
          competition?: string;
          season?: string;
          team_id?: string;
          table_position?: number;
          played?: number;
          won?: number;
          drawn?: number;
          lost?: number;
          goals_for?: number;
          goals_against?: number;
          points?: number;
          synced_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "standings_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      external_api_cache: {
        Row: {
          cache_key: string;
          payload: Json;
          fetched_at: string;
          expires_at: string;
        };
        Insert: {
          cache_key: string;
          payload: Json;
          fetched_at?: string;
          expires_at: string;
        };
        Update: {
          cache_key?: string;
          payload?: Json;
          fetched_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
          points_awarded: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
          points_awarded?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          home_score?: number;
          away_score?: number;
          points_awarded?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "predictions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "predictions_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          match_id: string | null;
          parent_id: string | null;
          body: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          moderation_status: "approved" | "flagged";
          moderation_reason: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id?: string | null;
          parent_id?: string | null;
          body: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          moderation_status?: "approved" | "flagged";
          moderation_reason?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string | null;
          parent_id?: string | null;
          body?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          moderation_status?: "approved" | "flagged";
          moderation_reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          direct_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          direct_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          direct_key?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      conversation_members: {
        Row: {
          conversation_id: string;
          user_id: string;
          joined_at: string;
          last_read_at: string | null;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          joined_at?: string;
          last_read_at?: string | null;
        };
        Update: {
          conversation_id?: string;
          user_id?: string;
          joined_at?: string;
          last_read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_blocks: {
        Row: {
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocker_id_fkey";
            columns: ["blocker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_blocks_blocked_id_fkey";
            columns: ["blocked_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      blocked_post_attempts: {
        Row: {
          id: string;
          user_id: string;
          body: string;
          parent_id: string | null;
          match_id: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          body: string;
          parent_id?: string | null;
          match_id?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          body?: string;
          parent_id?: string | null;
          match_id?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocked_post_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      polls: {
        Row: {
          id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: true;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          label: string;
          position: number;
        };
        Insert: {
          id?: string;
          poll_id: string;
          label: string;
          position?: number;
        };
        Update: {
          id?: string;
          poll_id?: string;
          label?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
        ];
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "poll_votes_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "poll_options";
            referencedColumns: ["id"];
          },
        ];
      };
      card_match_sync: {
        Row: {
          match_id: string;
          competition: string;
          match_date: string;
          synced_card_slugs: string[];
          processed_at: string;
        };
        Insert: {
          match_id: string;
          competition: string;
          match_date: string;
          synced_card_slugs?: string[];
          processed_at?: string;
        };
        Update: {
          match_id?: string;
          competition?: string;
          match_date?: string;
          synced_card_slugs?: string[];
          processed_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'moderator';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'admin' | 'moderator';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'moderator';
          created_at?: string;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: 'user' | 'post' | 'cache' | 'banner' | 'system' | 'poll';
          target_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_type: 'user' | 'post' | 'cache' | 'banner' | 'system' | 'poll';
          target_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          target_type?: 'user' | 'post' | 'cache' | 'banner' | 'system' | 'poll';
          target_id?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      system_announcements: {
        Row: {
          id: string;
          message: string;
          type: 'info' | 'warning' | 'alert';
          is_active: boolean;
          read_only_wall: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          message: string;
          type?: 'info' | 'warning' | 'alert';
          is_active?: boolean;
          read_only_wall?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          message?: string;
          type?: 'info' | 'warning' | 'alert';
          is_active?: boolean;
          read_only_wall?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_conversation_member: {
        Args: { p_conversation_id: string };
        Returns: boolean;
      };
      can_message_conversation: {
        Args: { p_conversation_id: string };
        Returns: boolean;
      };
      get_or_create_direct_conversation: {
        Args: { p_other_user: string };
        Returns: string;
      };
      is_admin: {
        Args: { user_uuid?: string };
        Returns: boolean;
      };
      apply_prediction_points: {
        Args: { p_prediction_id: string; p_points: number };
        Returns: void;
      };
    };
    Enums: {
      match_status: MatchStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
