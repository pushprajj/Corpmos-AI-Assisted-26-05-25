                     pg_get_functiondef                     
------------------------------------------------------------
 CREATE OR REPLACE FUNCTION public.update_modified_column()+
  RETURNS trigger                                          +
  LANGUAGE plpgsql                                         +
 AS $function$                                             +
 BEGIN                                                     +
   NEW.updated_at = NOW();                                 +
   RETURN NEW;                                             +
 END;                                                      +
 $function$                                                +
 
(1 row)

