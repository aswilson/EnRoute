# Be sure to restart your server when you modify this file.

# Your secret key is used for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!

# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
# You can use `rake secret` to generate a secure secret key.

# Make sure your secret_key_base is kept private
# if you're sharing your code publicly.
EnRoute::Application.config.secret_key_base = '7e9ba1bd7d898a1b76d57e66ba805e74f4323269f6e93c12c044ac85e31759334f71ce91efb88efd89b828f708a9aff9008aa712b6c31b9ed43f3cdcadc2a9f5'
