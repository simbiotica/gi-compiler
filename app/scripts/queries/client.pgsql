select client, client_id, product_id, product_name
from products
where client_id = '%(id)s'
