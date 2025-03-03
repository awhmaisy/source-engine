import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      console.error('Missing message in request body');
      return NextResponse.json(
        { 
          error: "Missing message", 
          details: "The 'message' field is required" 
        },
        { status: 400 }
      );
    }

    // For development, just return a Twitter intent URL
    // This allows testing the UI without actual Twitter API integration
    const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    return NextResponse.json({ link: tweetIntentUrl });

    /* Uncomment this section when you have valid Twitter API credentials
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_X_API_KEY || 
        !process.env.NEXT_PUBLIC_X_API_SECRET || 
        !process.env.NEXT_PUBLIC_X_ACCESS_TOKEN || 
        !process.env.NEXT_PUBLIC_X_ACCESS_TOKEN_SECRET) {
      console.error('Missing Twitter API credentials in environment variables');
      return NextResponse.json(
        { 
          error: "Server configuration error", 
          details: "The server is missing required Twitter API credentials. Please check environment variables."
        },
        { status: 500 }
      );
    }

    try {
      // Create OAuth 1.0a instance
      const oauth = new OAuth({
        consumer: {
          key: process.env.NEXT_PUBLIC_X_API_KEY,
          secret: process.env.NEXT_PUBLIC_X_API_SECRET
        },
        signature_method: 'HMAC-SHA1',
        hash_function(baseString, key) {
          return crypto
            .createHmac('sha1', key)
            .update(baseString)
            .digest('base64');
        }
      });

      // Request data
      const requestData = {
        url: 'https://api.twitter.com/2/tweets',
        method: 'POST'
      };

      // Get authorization header
      const authHeader = oauth.toHeader(oauth.authorize(requestData, {
        key: process.env.NEXT_PUBLIC_X_ACCESS_TOKEN,
        secret: process.env.NEXT_PUBLIC_X_ACCESS_TOKEN_SECRET
      }));

      // Post the tweet
      const twitterResponse = await axios.post(
        'https://api.twitter.com/2/tweets',
        { text: message },
        { 
          headers: { 
            ...authHeader,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!twitterResponse.data.data?.id) {
        console.error('Invalid response from Twitter API:', twitterResponse.data);
        return NextResponse.json(
          { 
            error: "Invalid API response format", 
            details: "The Twitter API returned data in an unexpected format"
          },
          { status: 500 }
        );
      }

      const tweetId = twitterResponse.data.data.id;
      // Get the username from the access token (first part before the dash)
      const username = process.env.NEXT_PUBLIC_X_ACCESS_TOKEN.split('-')[0];
      const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;
      
      return NextResponse.json({ link: tweetUrl });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Twitter API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        // If Twitter API rate limit is exceeded
        if (error.response?.status === 429) {
          return NextResponse.json(
            { 
              error: "Twitter API rate limit exceeded",
              details: "Please try again later."
            },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { 
            error: "Failed to post tweet",
            details: error.response?.data?.detail || error.message,
            status: error.response?.status,
            data: JSON.stringify(error.response?.data || {})
          },
          { status: error.response?.status || 500 }
        );
      }
      
      throw error; // Re-throw if it's not an Axios error
    }
    */
  } catch (error) {
    console.error('Tweet API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: "An unexpected error occurred", 
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 