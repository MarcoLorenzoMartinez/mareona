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

export type CardPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

export type CardDecade =
  | '1920s'
  | '1930s'
  | '1940s'
  | '1950s'
  | '1960s'
  | '1970s'
  | '1980s'
  | '1990s'
  | '2000s'
  | '2010s'
  | '2020s';

export type CardDuelMode = 'quick_3' | 'lineup_11';

export type CardDuelStatus = 'waiting' | 'in_progress' | 'finished' | 'abandoned';

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
          sporting_scorers: string[];
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
          sporting_scorers?: string[];
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
          sporting_scorers?: string[];
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
          sender_id: string | null;
          body: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id?: string | null;
          body: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string | null;
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
          user_id: string | null;
          body: string;
          parent_id: string | null;
          match_id: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          body: string;
          parent_id?: string | null;
          match_id?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
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
          admin_id: string | null;
          action: string;
          target_type: 'user' | 'post' | 'cache' | 'banner' | 'system' | 'poll';
          target_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          target_type: 'user' | 'post' | 'cache' | 'banner' | 'system' | 'poll';
          target_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
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
      site_visits: {
        Row: {
          id: number;
          pathname: string;
          device_type: string;
          is_pwa: boolean;
          session_id: string | null;
          duration_seconds: number;
          country: string;
          province: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          pathname: string;
          device_type: string;
          is_pwa?: boolean;
          session_id?: string | null;
          duration_seconds?: number;
          country?: string;
          province?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          pathname?: string;
          device_type?: string;
          is_pwa?: boolean;
          session_id?: string | null;
          duration_seconds?: number;
          country?: string;
          province?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_reports: {
        Row: {
          id: string;
          reporter_id: string | null;
          reported_id: string | null;
          conversation_id: string | null;
          category: 'harassment' | 'threats' | 'spam_scam' | 'impersonation' | 'other';
          details: string | null;
          evidence_snapshot: string | null;
          status: 'pending' | 'reviewed' | 'dismissed';
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id?: string | null;
          reported_id?: string | null;
          conversation_id?: string | null;
          category: 'harassment' | 'threats' | 'spam_scam' | 'impersonation' | 'other';
          details?: string | null;
          evidence_snapshot?: string | null;
          status?: 'pending' | 'reviewed' | 'dismissed';
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string | null;
          reported_id?: string | null;
          conversation_id?: string | null;
          category?: 'harassment' | 'threats' | 'spam_scam' | 'impersonation' | 'other';
          details?: string | null;
          evidence_snapshot?: string | null;
          status?: 'pending' | 'reviewed' | 'dismissed';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_reports_reported_id_fkey";
            columns: ["reported_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_reports_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      match_mvp_votes: {
        Row: {
          id: string;
          match_id: string;
          user_id: string;
          player_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          user_id: string;
          player_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          user_id?: string;
          player_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_mvp_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      match_player_ratings: {
        Row: {
          id: string;
          match_id: string;
          user_id: string;
          target_id: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          user_id: string;
          target_id: string;
          rating: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          user_id?: string;
          target_id?: string;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_player_ratings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cards: {
        Row: {
          id: string;
          slug: string;
          full_name: string;
          known_as: string;
          decade: CardDecade;
          era_label: string;
          position: CardPosition;
          matches_played: number;
          attack_power: number;
          defense_power: number;
          ovr: number;
          photo_url: string;
          historical_crest_url: string | null;
          historical_crest_era: string;
          bio_snippet: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          full_name: string;
          known_as: string;
          decade: CardDecade;
          era_label: string;
          position: CardPosition;
          matches_played: number;
          attack_power: number;
          defense_power: number;
          ovr: number;
          photo_url: string;
          historical_crest_url?: string | null;
          historical_crest_era?: string;
          bio_snippet?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          full_name?: string;
          known_as?: string;
          decade?: CardDecade;
          era_label?: string;
          position?: CardPosition;
          matches_played?: number;
          attack_power?: number;
          defense_power?: number;
          ovr?: number;
          photo_url?: string;
          historical_crest_url?: string | null;
          historical_crest_era?: string;
          bio_snippet?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_cards: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          quantity: number;
          acquired_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          quantity?: number;
          acquired_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_id?: string;
          quantity?: number;
          acquired_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_cards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_cards_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
        ];
      };
      user_packs: {
        Row: {
          id: string;
          user_id: string;
          pack_type: string;
          card_count: number;
          is_opened: boolean;
          opened_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pack_type?: string;
          card_count?: number;
          is_opened?: boolean;
          opened_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pack_type?: string;
          card_count?: number;
          is_opened?: boolean;
          opened_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_packs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      card_duels: {
        Row: {
          id: string;
          host_user_id: string;
          guest_user_id: string | null;
          mode: CardDuelMode;
          status: CardDuelStatus;
          formation_host: string | null;
          formation_guest: string | null;
          current_round: number;
          rounds_total: number;
          host_score: number;
          guest_score: number;
          winner_user_id: string | null;
          state: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_user_id: string;
          guest_user_id?: string | null;
          mode?: CardDuelMode;
          status?: CardDuelStatus;
          formation_host?: string | null;
          formation_guest?: string | null;
          current_round?: number;
          rounds_total?: number;
          host_score?: number;
          guest_score?: number;
          winner_user_id?: string | null;
          state?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_user_id?: string;
          guest_user_id?: string | null;
          mode?: CardDuelMode;
          status?: CardDuelStatus;
          formation_host?: string | null;
          formation_guest?: string | null;
          current_round?: number;
          rounds_total?: number;
          host_score?: number;
          guest_score?: number;
          winner_user_id?: string | null;
          state?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_account_state: {
        Row: {
          user_id: string;
          cards: Json;
          packs: Json;
          missions: Json;
          has_activity: boolean;
          revision: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          cards?: Json;
          packs?: Json;
          missions?: Json;
          has_activity?: boolean;
          revision?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          cards?: Json;
          packs?: Json;
          missions?: Json;
          has_activity?: boolean;
          revision?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_account_state_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
      soft_delete_direct_message: {
        Args: { p_message_id: string };
        Returns: boolean;
      };
      delete_current_user: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
      is_admin: {
        Args: { user_uuid?: string };
        Returns: boolean;
      };
      is_user_banned: {
        Args: { user_uuid?: string };
        Returns: boolean;
      };
      is_wall_read_only: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      apply_prediction_points: {
        Args: { p_prediction_id: string; p_points: number };
        Returns: void;
      };
      open_card_pack: {
        Args: { p_pack_id: string; p_user_id: string };
        Returns: {
          card_id: string;
          slug: string;
          known_as: string;
          position: CardPosition;
          decade: CardDecade;
          photo_url: string;
          ovr: number;
          is_new: boolean;
        }[];
      };
      cast_match_mvp_vote: {
        Args: { p_match_id: string; p_player_id: string };
        Returns: void;
      };
      upsert_match_player_rating: {
        Args: { p_match_id: string; p_target_id: string; p_rating: number };
        Returns: void;
      };
      get_match_mvp_summary: {
        Args: { p_match_id: string };
        Returns: { player_id: string; votes: number }[];
      };
      get_match_player_ratings_summary: {
        Args: { p_match_id: string };
        Returns: { target_id: string; avg_rating: number; votes: number }[];
      };
      get_porra_leaderboard_stats: {
        Args: { p_limit?: number };
        Returns: {
          user_id: string;
          username: string;
          display_name: string | null;
          points: number;
          predictions_count: number;
          exact_hits: number;
        }[];
      };
      get_admin_telemetry_summary: {
        Args: { p_days?: number };
        Returns: Json;
      };
    };
    Enums: {
      match_status: MatchStatus;
      card_position: CardPosition;
      card_decade: CardDecade;
      card_duel_mode: CardDuelMode;
      card_duel_status: CardDuelStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
