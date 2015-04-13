FactoryGirl.define do
  
  factory :user do
    first_name "John"
    last_name "Black"
    username "john123"
    password "password"
    password_confirmation "password"
    email "john@email.com"
    phone "412-000-0000"
    role "administrator"
    active true
    street_1 "5000 Forbes Ave"
    city "Pittsburgh"
    state "PA"
    zip_code "15213"
  end
  
  factory :service do
    name "coffee"
    description "offers coffee drinks and such for purchase"
    active true
  end
  
  factory :business do
    name "Starbucks"
    description "chain coffee shop selling drinks and pastries"
    phone "412-999-9999"
    street_1 "417 S Craig St"
    city "Pittsburgh"
    state "PA"
    zip_code "15213"
    association :user
    active true
  end
  
  factory :business_service do
    association :business
    association :service
    active true
  end
  
end