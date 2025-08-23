import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface SMSNotification {
  to: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // POST /api-notifications/email - Send email notification
    if (method === 'POST' && path === '/api-notifications/email') {
      const emailData: EmailNotification = await req.json()

      // Here you would integrate with your email service (SendGrid, Resend, etc.)
      // For now, we'll simulate the email sending
      
      console.log('Email notification sent:', {
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      })

      // Example with Resend (you'd need to add Resend to your imports)
      /*
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
      
      const { data, error } = await resend.emails.send({
        from: emailData.from || 'TriExpert Services <noreply@triexpertservice.com>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })

      if (error) throw error
      */

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        // data: data // Uncomment when using real email service
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST /api-notifications/sms - Send SMS notification
    if (method === 'POST' && path === '/api-notifications/sms') {
      const smsData: SMSNotification = await req.json()

      // Here you would integrate with your SMS service (Twilio, etc.)
      // For now, we'll simulate the SMS sending
      
      console.log('SMS notification sent:', {
        to: smsData.to,
        message: smsData.message.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      })

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST /api-notifications/webhook - Webhook for N8N integrations
    if (method === 'POST' && path === '/api-notifications/webhook') {
      const webhookData = await req.json()
      
      // Process the webhook data
      console.log('Webhook received:', {
        type: webhookData.type || 'unknown',
        timestamp: new Date().toISOString(),
        data: webhookData
      })

      // You can add logic here to process different types of webhooks
      // For example: new translation request, lead status change, review submission, etc.

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        received_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    })

  } catch (error) {
    console.error('Notifications API Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})