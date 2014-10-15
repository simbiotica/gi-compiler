with a AS (
  select client_id AS id
  from products
  where product_id = '%(product_id)s'
)

select exists (

  select a.id
  from products, a
  where client_id = a.id
  and client_id = '%(id)s'

) as valid
from products
limit 1
