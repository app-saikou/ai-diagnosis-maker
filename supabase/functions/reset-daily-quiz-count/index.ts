import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log('=== Daily Reset Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Supabase admin client created successfully');

    // Get current date in JST (Japan Standard Time)
    const now = new Date();
    console.log('Current UTC time:', now.toISOString());
    
    const jstOffset = 9 * 60; // JST is UTC+9
    const jstTime = new Date(now.getTime() + (jstOffset * 60 * 1000));
    console.log('Current JST time:', jstTime.toISOString());
    
    const currentDate = jstTime.toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log('Calculated currentDate:', currentDate);

    console.log(`Starting daily reset for date: ${currentDate}`);

    // First, let's check how many users need to be reset
    const { data: usersToReset, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, display_name, last_reset, quizzes_taken_today')
      .neq('last_reset', currentDate);

    if (checkError) {
      console.error('Error checking users to reset:', checkError);
      throw checkError;
    }

    console.log(`Found ${usersToReset?.length || 0} users that need reset`);
    console.log('Users to reset:', usersToReset?.map(u => ({
      id: u.id,
      display_name: u.display_name,
      last_reset: u.last_reset,
      quizzes_taken_today: u.quizzes_taken_today
    })));

    // Reset quiz count for all users whose last_reset is not today
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        quizzes_taken_today: 0,
        last_reset: currentDate
      })
      .neq('last_reset', currentDate)
      .select('id, display_name, last_reset, quizzes_taken_today');

    console.log('Update operation completed');
    console.log('Update result - data:', data);
    console.log('Update result - error:', error);

    if (error) {
      console.error('Error resetting daily quiz count:', error);
      throw error;
    }

    const resetCount = data?.length || 0;
    console.log(`Successfully reset quiz count for ${resetCount} users`);
    console.log('Reset users details:', data?.map(u => ({
      id: u.id,
      display_name: u.display_name,
      last_reset: u.last_reset,
      quizzes_taken_today: u.quizzes_taken_today
    })));

    const response = {
      success: true,
      message: `Daily quiz count reset completed for ${resetCount} users`,
      date: currentDate,
      resetUsers: resetCount,
      utcTime: now.toISOString(),
      jstTime: jstTime.toISOString(),
      calculatedDate: currentDate
    };

    console.log('Final response:', response);
    console.log('=== Daily Reset Function Completed Successfully ===');

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('=== Daily Reset Function Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '日次リセット中にエラーが発生しました',
        errorDetails: error instanceof Error ? error.stack : 'No details available'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});