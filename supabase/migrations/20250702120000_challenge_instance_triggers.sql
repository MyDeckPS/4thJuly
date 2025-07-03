-- Trigger: When a new challenge is created, create user_challenge_instances for all past buyers
create or replace function public.create_challenge_instances_for_past_buyers()
returns trigger as $$
begin
  insert into public.user_challenge_instances (
    user_id,
    product_challenge_id,
    user_product_purchase_id,
    status,
    points_earned
  )
  select
    upp.user_id,
    NEW.id as product_challenge_id,
    upp.id as user_product_purchase_id,
    'available' as status,
    0 as points_earned
  from public.user_product_purchases upp
  where upp.product_id = NEW.product_id;

  return NEW;
end;
$$ language plpgsql;

create trigger trg_create_challenge_instances_for_past_buyers
after insert on public.product_challenges
for each row execute function public.create_challenge_instances_for_past_buyers();

-- Trigger: When a new purchase is made, create user_challenge_instances for all active challenges for that product
create or replace function public.create_challenge_instances_for_new_purchase()
returns trigger as $$
begin
  insert into public.user_challenge_instances (
    user_id,
    product_challenge_id,
    user_product_purchase_id,
    status,
    points_earned
  )
  select
    NEW.user_id,
    pc.id as product_challenge_id,
    NEW.id as user_product_purchase_id,
    'available' as status,
    0 as points_earned
  from public.product_challenges pc
  where pc.product_id = NEW.product_id and pc.is_active = true;

  return NEW;
end;
$$ language plpgsql;

create trigger trg_create_challenge_instances_for_new_purchase
after insert on public.user_product_purchases
for each row execute function public.create_challenge_instances_for_new_purchase(); 