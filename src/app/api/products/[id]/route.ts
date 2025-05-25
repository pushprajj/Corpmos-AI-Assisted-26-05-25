import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Ensure the pool is closed when the process exits
process.on('SIGINT', () => {
  pool.end().then(() => {
    console.log('PostgreSQL pool has ended');
    process.exit(0);
  });
});

export async function DELETE(
  _request: NextRequest, 
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();

  try {
    console.log('Delete request received for product ID:', params.id);

    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('Unauthorized delete attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;

    // Log session and user details for debugging
    console.log('Session user ID:', session.user.id);

    // First, get the business ID for the current user
    const businessQuery = {
      text: 'SELECT id FROM businesses WHERE owner_id = $1',
      values: [session.user.id]
    };

    const businessResult = await client.query(businessQuery);
    
    if (businessResult.rows.length === 0) {
      console.log('No business found for user');
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    const businessId = businessResult.rows[0].id;
    console.log('Business ID:', businessId);

    // Check if the product exists and belongs to the user's business
    const checkQuery = {
      text: 'SELECT * FROM products WHERE id = $1 AND business_id = $2',
      values: [productId, businessId]
    };

    const checkResult = await client.query(checkQuery);

    // Log detailed query information
    console.log('Check query values:', checkQuery.values);
    console.log('Check query result rows:', checkResult.rows);
    console.log('Check query result row count:', checkResult.rows.length);

    if (checkResult.rows.length === 0) {
      // Additional logging to understand why the product is not found
      const allProductsQuery = {
        text: 'SELECT id, business_id FROM products WHERE id = $1',
        values: [productId]
      };
      const allProductsResult = await client.query(allProductsQuery);
      console.log('All products with this ID:', allProductsResult.rows);

      console.log('Product not found or does not belong to user');
      return NextResponse.json({ 
        error: 'Product not found', 
        details: {
          productId, 
          businessId,
          matchingProducts: allProductsResult.rows
        } 
      }, { status: 404 });
    }

    // Delete the product from the database
    const deleteQuery = {
      text: 'DELETE FROM products WHERE id = $1 AND business_id = $2 RETURNING *',
      values: [productId, businessId]
    };

    const deleteResult = await client.query(deleteQuery);

    console.log('Product deleted successfully:', deleteResult.rows[0]);
    return NextResponse.json(deleteResult.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    // More detailed error handling
    let errorDetails = 'Unknown error';
    if (error instanceof Error) {
      errorDetails = error.message;
    } else if (typeof error === 'object') {
      try {
        errorDetails = JSON.stringify(error, null, 2);
      } catch {
        errorDetails = String(error);
      }
    } else {
      errorDetails = String(error);
    }

    return NextResponse.json({ 
      error: 'Failed to delete product', 
      details: errorDetails 
    }, { status: 500 });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();

  try {
    console.log('Update request received for product ID:', params.id);

    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('Unauthorized update attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;

    // Get the business ID for the current user
    const businessQuery = {
      text: 'SELECT id FROM businesses WHERE owner_id = $1',
      values: [session.user.id]
    };

    const businessResult = await client.query(businessQuery);
    
    if (businessResult.rows.length === 0) {
      console.log('No business found for user');
      return NextResponse.json({ error: 'No business found' }, { status: 404 });
    }

    const businessId = businessResult.rows[0].id;
    console.log('Business ID:', businessId);

    // Parse the request body
    const body = await request.json();
    console.log('Update request body:', body);

    // Validate the input
    const { 
      name, 
      description, 
      quantity, 
      cost, 
      price, 
      photo_url, 
      availability,
      sku,
      category 
    } = body;

    // Prepare the update query
    const updateQuery = {
      text: `
        UPDATE products 
        SET 
          name = $1, 
          description = $2, 
          quantity = $3, 
          cost = $4, 
          price = $5, 
          photo_url = $6, 
          availability = $7,
          sku = $8,
          category = $9
        WHERE id = $10 AND business_id = $11
        RETURNING *
      `,
      values: [
        name, 
        description, 
        quantity, 
        cost, 
        price, 
        photo_url, 
        availability,
        sku,
        category,
        productId,
        businessId
      ]
    };

    const updateResult = await client.query(updateQuery);

    // Check if the product was actually updated
    if (updateResult.rows.length === 0) {
      console.log('No product found to update');
      return NextResponse.json({ 
        error: 'Product not found or does not belong to you', 
        details: { productId, businessId } 
      }, { status: 404 });
    }

    console.log('Product updated successfully:', updateResult.rows[0]);
    return NextResponse.json(updateResult.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    
    // More detailed error handling
    let errorDetails = 'Unknown error';
    if (error instanceof Error) {
      errorDetails = error.message;
    } else if (typeof error === 'object') {
      try {
        errorDetails = JSON.stringify(error, null, 2);
      } catch {
        errorDetails = String(error);
      }
    } else {
      errorDetails = String(error);
    }

    return NextResponse.json({ 
      error: 'Failed to update product', 
      details: errorDetails 
    }, { status: 500 });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}
