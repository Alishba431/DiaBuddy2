const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ewawyznmynbmdxwpjrie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3YXd5em5teW5ibWR4d3BqcmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2Njk1MzYsImV4cCI6MjA5NTI0NTUzNn0.W7AZZtHc2DBiTKbzO12zDPRKpsFHWjg9KAQepBHD7OU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEnums() {
  try {
    const testTags = [
      'pre_snack', 'post_snack', 'before_snack', 'after_snack',
      'exercise', 'activity', 'pre_meal', 'before_meal',
      'post_exercise', 'pre_exercise', 'before_exercise'
    ];
    for (const tag of testTags) {
      const { error: insError } = await supabase
        .from('glucose_readings')
        .insert({
          child_profile_id: '00000000-0000-0000-0000-000000000000',
          reading_value: 100,
          reading_tag: tag
        });
      
      console.log(`Inserting '${tag}':`, insError ? insError.message : 'Success');
    }

  } catch (err) {
    console.error(err);
  }
}

checkEnums();
