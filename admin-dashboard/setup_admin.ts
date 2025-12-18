import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://temqncyzruryimbbzfcv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbXFuY3l6cnVyeWltYmJ6ZmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Nzc1OTEsImV4cCI6MjA4MTQ1MzU5MX0.acNeAflrno3U7fDknRVQkAcuEI3Rx7jUgDwcbUsy-w4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setup() {
    console.log('Creating Admin User (Retry)...')
    // Attempt 1: Standard example.com
    let email = 'admin@example.com'
    let { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'password123',
    })

    if (error) {
        console.error(`Error creating ${email}:`, error)
        // Attempt 2: Random one
        email = `admin${Date.now()}@example.com`
        console.log(`Retrying with ${email}...`)
        const res = await supabase.auth.signUp({
            email: email,
            password: 'password123',
        })
        data = res.data
        error = res.error
    }

    if (error) {
        console.error('Final Failure:', error)
    } else {
        console.log('User created successfully:', data.user?.id)
        console.log('Email:', email)
        console.log('The Triggers should have auto-created the Gym and Public User record.')
    }
}

setup()
