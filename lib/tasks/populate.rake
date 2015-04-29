namespace :db do
  desc "Erase and fill database"
  # creating a rake task within db namespace called 'populate'
  # executing 'rake db:populate' will cause this script to run
  task :populate => :environment do


#comment this stuff out to get populate to work locally:
    #Rake::Task['db:drop'].invoke
    #Rake::Task['db:create'].invoke
    # Invoke rake db:migrate
    #Rake::Task['db:migrate'].invoke
    #Rake::Task['db:test:prepare'].invoke
    Rake::Task['db:reset'].invoke
    
    #Step 1: Create admin users for everyone
    allie = User.new
    allie.first_name = "Allie"
    allie.last_name = "Wilson"
    allie.username = "aswilson"
    allie.password = "secret"
    allie.password_confirmation = "secret"
    allie.email = "aswilson@email.com"
    allie.phone = "412-000-0000"
    allie.role = "Administrator"
    allie.street_1 = "5000 Forbes Ave"
    allie.city = "Pittsburgh"
    allie.state = "PA"
    allie.zip_code = "15213"
    allie.active = true
    allie.save!
    
    sleep 0.2
    
    jackie = User.new
    jackie.first_name = "Jacklin"
    jackie.last_name = "Wu"
    jackie.username = "jacklinw"
    jackie.password = "secret"
    jackie.password_confirmation = "secret"
    jackie.email = "jacklinw@email.com"
    jackie.phone = "412-000-0000"
    jackie.role = "Administrator"
    jackie.street_1 = "5000 Forbes Ave"
    jackie.city = "Pittsburgh"
    jackie.state = "PA"
    jackie.zip_code = "15213"
    jackie.active = true
    jackie.save!
    sleep 0.2
    joseph = User.new
    joseph.first_name = "Joseph"
    joseph.last_name = "Richardson"
    joseph.username = "jmrichar"
    joseph.password = "secret"
    joseph.password_confirmation = "secret"
    joseph.email = "jmrichar@email.com"
    joseph.phone = "412-000-0000"
    joseph.role = "Administrator"
    joseph.street_1 = "5000 Forbes Ave"
    joseph.city = "Pittsburgh"
    joseph.state = "PA"
    joseph.zip_code = "15213"
    joseph.active = true
    joseph.save!
    sleep 0.2
    lindsay = User.new
    lindsay.first_name = "Lindsay"
    lindsay.last_name = "Corry"
    lindsay.username = "lcorry"
    lindsay.password = "secret"
    lindsay.password_confirmation = "secret"
    lindsay.email = "lcorry@email.com"
    lindsay.phone = "412-000-0000"
    lindsay.role = "Administrator"
    lindsay.street_1 = "5000 Forbes Ave"
    lindsay.city = "Pittsburgh"
    lindsay.state = "PA"
    lindsay.zip_code = "15213"
    lindsay.active = true
    lindsay.save!
    sleep 0.2
    siyun = User.new
    siyun.first_name = "Siyun"
    siyun.last_name = "Li"
    siyun.username = "siyunli"
    siyun.password = "secret"
    siyun.password_confirmation = "secret"
    siyun.email = "siyunli@email.com"
    siyun.phone = "412-000-0000"
    siyun.role = "Administrator"
    siyun.street_1 = "5000 Forbes Ave"
    siyun.city = "Pittsburgh"
    siyun.state = "PA"
    siyun.zip_code = "15213"
    siyun.active = true
    siyun.save!

    #Step 2: Create services
    post = Service.new
    post.name = "Post Office"
    post.active = true
    post.save!
    
    book = Service.new
    book.name = "Books"
    book.active = true
    book.save!
    
    food = Service.new
    food.name = "Food"
    food.active = true
    food.save!
    
    shopping = Service.new
    shopping.name = "Shopping"
    shopping.active = true
    shopping.save!
    
    gas = Service.new
    gas.name = "Gas"
    gas.active = true
    gas.save!
    
    coffee = Service.new
    coffee.name = "Coffee"
    coffee.active = true
    coffee.save!
    
    atm = Service.new
    atm.name = "ATM"
    atm.active = true
    atm.save!
    
    bank = Service.new
    bank.name = "Bank"
    bank.active = true
    bank.save!
    
    pharm = Service.new
    pharm.name = "Pharmacy"
    pharm.active = true
    pharm.save!
    
    # Step 3: Create businesses with related services
    arby = Business.new
    arby.name = "Arby's"
    arby.description = "Oakland"
    arby.phone = ""
    arby.schedule = ""
    arby.street_1 = "3417 Forbes Ave"
    arby.street_2 = ""
    arby.city = "Pittsburgh"
    arby.state = "PA"
    arby.zip_code = "15213"
    arby.user_id = allie.id
    arby.active = true
    arby.save!
    sleep 0.2
    arby1 = BusinessService.new
    arby1.business_id = arby.id
    arby1.service_id = food.id
    arby1.active = true
    arby1.save!
    
    palma = Business.new
    palma.name = "Las Palmas"
    palma.description = "Oakland"
    palma.phone = ""
    palma.schedule = ""
    palma.street_1 = "326 Atwood St"
    palma.street_2 = ""
    palma.city = "Pittsburgh"
    palma.state = "PA"
    palma.zip_code = "15213"
    palma.user_id = allie.id
    palma.active = true
    palma.save!
    sleep 0.2
    palma1 = BusinessService.new
    palma1.business_id = palma.id
    palma1.service_id = food.id
    palma1.active = true
    palma1.save!
    
    spice = Business.new
    spice.name = "Spice Island Tea House"
    spice.description = "Oakland"
    spice.phone = ""
    spice.schedule = ""
    spice.street_1 = "253 Atwood St"
    spice.street_2 = ""
    spice.city = "Pittsburgh"
    spice.state = "PA"
    spice.zip_code = "15213"
    spice.user_id = allie.id
    spice.active = true
    spice.save!
    sleep 0.2
    spice1 = BusinessService.new
    spice1.business_id = spice.id
    spice1.service_id = food.id
    spice1.active = true
    spice1.save!
    
    leg = Business.new
    leg.name = "Legume"
    leg.description = "Oakland"
    leg.phone = ""
    leg.schedule = ""
    leg.street_1 = "214 N Craig St"
    leg.street_2 = ""
    leg.city = "Pittsburgh"
    leg.state = "PA"
    leg.zip_code = "15213"
    leg.user_id = allie.id
    leg.active = true
    leg.save!
    sleep 0.2
    leg1 = BusinessService.new
    leg1.business_id = leg.id
    leg1.service_id = food.id
    leg1.active = true
    leg1.save!
    
    bang = Business.new
    bang.name = "Bangal Kabab House & Restaurant"
    bang.description = "Oakland"
    bang.phone = ""
    bang.schedule = ""
    bang.street_1 = "320 Atwood St"
    bang.street_2 = ""
    bang.city = "Pittsburgh"
    bang.state = "PA"
    bang.zip_code = "15213"
    bang.user_id = allie.id
    bang.active = true
    bang.save!
    sleep 0.2
    bang1 = BusinessService.new
    bang1.business_id = bang.id
    bang1.service_id = food.id
    bang1.active = true
    bang1.save!
    
    oish = Business.new
    oish.name = "Oishii Bento"
    oish.description = "Oakland"
    oish.phone = ""
    oish.schedule = ""
    oish.street_1 = "119 Oakland Ave"
    oish.street_2 = ""
    oish.city = "Pittsburgh"
    oish.state = "PA"
    oish.zip_code = "15213"
    oish.user_id = allie.id
    oish.active = true
    oish.save!
    sleep 0.2
    oish1 = BusinessService.new
    oish1.business_id = oish.id
    oish1.service_id = food.id
    oish1.active = true
    oish1.save!
    
    butter = Business.new
    butter.name = "Butterjoint"
    butter.description = "Oakland"
    butter.phone = ""
    butter.schedule = ""
    butter.street_1 = "214 N Craig St"
    butter.street_2 = ""
    butter.city = "Pittsburgh"
    butter.state = "PA"
    butter.zip_code = "15213"
    butter.user_id = allie.id
    butter.active = true
    butter.save!
    sleep 0.2
    butter1 = BusinessService.new
    butter1.business_id = butter.id
    butter1.service_id = food.id
    butter1.active = true
    butter1.save!
    
    tama = Business.new
    tama.name = "Tamarind Flavor of India"
    tama.description = "Oakland"
    tama.phone = ""
    tama.schedule = ""
    tama.street_1 = "257 N Craig St"
    tama.street_2 = ""
    tama.city = "Pittsburgh"
    tama.state = "PA"
    tama.zip_code = "15213"
    tama.user_id = allie.id
    tama.active = true
    tama.save!
    sleep 0.2
    tama1 = BusinessService.new
    tama1.business_id = tama.id
    tama1.service_id = food.id
    tama1.active = true
    tama1.save!
    
    groc = Business.new
    groc.name = "Groceria Merante"
    groc.description = "Oakland"
    groc.phone = ""
    groc.schedule = ""
    groc.street_1 = "3454 Bates St"
    groc.street_2 = ""
    groc.city = "Pittsburgh"
    groc.state = "PA"
    groc.zip_code = "15213"
    groc.user_id = allie.id
    groc.active = true
    groc.save!
    sleep 0.2
    groc1 = BusinessService.new
    groc1.business_id = groc.id
    groc1.service_id = food.id
    groc1.active = true
    groc1.save!
    
    groc2 = BusinessService.new
    groc2.business_id = groc.id
    groc2.service_id = shopping.id
    groc2.active = true
    groc2.save!
    
    red = Business.new
    red.name = "Red Oak Cafe"
    red.description = "Oakland"
    red.phone = ""
    red.schedule = ""
    red.street_1 = "3610 Forbes Ave"
    red.street_2 = ""
    red.city = "Pittsburgh"
    red.state = "PA"
    red.zip_code = "15213"
    red.user_id = allie.id
    red.active = true
    red.save!
    sleep 0.2
    red1 = BusinessService.new
    red1.business_id = red.id
    red1.service_id = coffee.id
    red1.active = true
    red1.save!

    fuel = Business.new
    fuel.name = "Fuel and Fuddle"
    fuel.description = "Oakland"
    fuel.phone = ""
    fuel.schedule = ""
    fuel.street_1 = "212 Oakland Ave"
    fuel.street_2 = ""
    fuel.city = "Pittsburgh"
    fuel.state = "PA"
    fuel.zip_code = "15213"
    fuel.user_id = allie.id
    fuel.active = true
    fuel.save!
    sleep 0.2
    fuel1 = BusinessService.new
    fuel1.business_id = fuel.id
    fuel1.service_id = food.id
    fuel1.active = true
    fuel1.save!

    porch = Business.new
    porch.name = "The Porch"
    porch.description = "Oakland"
    porch.phone = ""
    porch.schedule = ""
    porch.street_1 = "221 Schenley Dr"
    porch.street_2 = ""
    porch.city = "Pittsburgh"
    porch.state = "PA"
    porch.zip_code = "15213"
    porch.user_id = allie.id
    porch.active = true
    porch.save!
    sleep 0.2
    porch1 = BusinessService.new
    porch1.business_id = porch.id
    porch1.service_id = food.id
    porch1.active = true
    porch1.save!
    
    hello = Business.new
    hello.name = "Hello Bistro"
    hello.description = "Oakland"
    hello.phone = ""
    hello.schedule = ""
    hello.street_1 = "3605 Forbes Ave"
    hello.street_2 = ""
    hello.city = "Pittsburgh"
    hello.state = "PA"
    hello.zip_code = "15213"
    hello.user_id = allie.id
    hello.active = true
    hello.save!
    sleep 0.2
    hello1 = BusinessService.new
    hello1.business_id = hello.id
    hello1.service_id = food.id
    hello1.active = true
    hello1.save!

    crepe = Business.new
    crepe.name = "Crepes Parisiennes"
    crepe.description = "Oakland"
    crepe.phone = ""
    crepe.schedule = ""
    crepe.street_1 = "207 S Craig St"
    crepe.street_2 = ""
    crepe.city = "Pittsburgh"
    crepe.state = "PA"
    crepe.zip_code = "15213"
    crepe.user_id = allie.id
    crepe.active = true
    crepe.save!
    sleep 0.2
    crepe1 = BusinessService.new
    crepe1.business_id = crepe.id
    crepe1.service_id = food.id
    crepe1.active = true
    crepe1.save!
    
    pam = Business.new
    pam.name = "Pamela's"
    pam.description = "Oakland"
    pam.phone = ""
    pam.schedule = ""
    pam.street_1 = "3703 Forbes Ave"
    pam.street_2 = ""
    pam.city = "Pittsburgh"
    pam.state = "PA"
    pam.zip_code = "15213"
    pam.user_id = allie.id
    pam.active = true
    pam.save!
    sleep 0.2
    pam1 = BusinessService.new
    pam1.business_id = pam.id
    pam1.service_id = food.id
    pam1.active = true
    pam1.save!

    fuku = Business.new
    fuku.name = "Sushi Fuku"
    fuku.description = "Oakland"
    fuku.phone = ""
    fuku.schedule = ""
    fuku.street_1 = "120 Oakland Ave"
    fuku.street_2 = ""
    fuku.city = "Pittsburgh"
    fuku.state = "PA"
    fuku.zip_code = "15213"
    fuku.user_id = allie.id
    fuku.active = true
    fuku.save!
    sleep 0.2
    fuku1 = BusinessService.new
    fuku1.business_id = fuku.id
    fuku1.service_id = food.id
    fuku1.active = true
    fuku1.save!
    
    mex = Business.new
    mex.name = "Mad Mex"
    mex.description = "Oakland"
    mex.phone = ""
    mex.schedule = ""
    mex.street_1 = "370 Atwood St"
    mex.street_2 = ""
    mex.city = "Pittsburgh"
    mex.state = "PA"
    mex.zip_code = "15213"
    mex.user_id = allie.id
    mex.active = true
    mex.save!
    sleep 0.2
    mex1 = BusinessService.new
    mex1.business_id = mex.id
    mex1.service_id = food.id
    mex1.active = true
    mex1.save!
    
    ind = Business.new
    ind.name = "All India"
    ind.description = "Oakland"
    ind.phone = ""
    ind.schedule = ""
    ind.street_1 = "315 N Craig St"
    ind.street_2 = ""
    ind.city = "Pittsburgh"
    ind.state = "PA"
    ind.zip_code = "15213"
    ind.user_id = allie.id
    ind.active = true
    ind.save!
    sleep 0.2
    ind1 = BusinessService.new
    ind1.business_id = ind.id
    ind1.service_id = food.id
    ind1.active = true
    ind1.save!
    
    un = Business.new
    un.name = "Union Grill"
    un.description = "Oakland"
    un.phone = ""
    un.schedule = ""
    un.street_1 = "413 S Craig St"
    un.street_2 = ""
    un.city = "Pittsburgh"
    un.state = "PA"
    un.zip_code = "15213"
    un.user_id = allie.id
    un.active = true
    un.save!
    sleep 0.2
    un1 = BusinessService.new
    un1.business_id = un.id
    un1.service_id = food.id
    un1.active = true
    un1.save!
    
    sam = Business.new
    sam.name = "Uncle Sam's Submarines"
    sam.description = "Oakland"
    sam.phone = ""
    sam.schedule = ""
    sam.street_1 = "210 Oakland Ave"
    sam.street_2 = ""
    sam.city = "Pittsburgh"
    sam.state = "PA"
    sam.zip_code = "15213"
    sam.user_id = allie.id
    sam.active = true
    sam.save!
    sleep 0.2
    sam1 = BusinessService.new
    sam1.business_id = sam.id
    sam1.service_id = food.id
    sam1.active = true
    sam1.save!
    
    hot = Business.new
    hot.name = "Original Hot Dog Shop"
    hot.description = "Oakland"
    hot.phone = ""
    hot.schedule = ""
    hot.street_1 = "3901 Forbes Ave"
    hot.street_2 = ""
    hot.city = "Pittsburgh"
    hot.state = "PA"
    hot.zip_code = "15213"
    hot.user_id = allie.id
    hot.active = true
    hot.save!
    sleep 0.2
    hot1 = BusinessService.new
    hot1.business_id = hot.id
    hot1.service_id = food.id
    hot1.active = true
    hot1.save!
    
    chip = Business.new
    chip.name = "Chipotle Mexican Grill"
    chip.description = "Oakland"
    chip.phone = ""
    chip.schedule = ""
    chip.street_1 = "3619 Forbes Ave"
    chip.street_2 = ""
    chip.city = "Pittsburgh"
    chip.state = "PA"
    chip.zip_code = "15213"
    chip.user_id = allie.id
    chip.active = true
    chip.save!
    sleep 0.2
    chip1 = BusinessService.new
    chip1.business_id = chip.id
    chip1.service_id = food.id
    chip1.active = true
    chip1.save!
    
    jim = Business.new
    jim.name = "Jimmy John's"
    jim.description = "Oakland"
    jim.phone = ""
    jim.schedule = ""
    jim.street_1 = "3444 Forbes Ave"
    jim.street_2 = ""
    jim.city = "Pittsburgh"
    jim.state = "PA"
    jim.zip_code = "15213"
    jim.user_id = allie.id
    jim.active = true
    jim.save!
    sleep 0.2
    jim1 = BusinessService.new
    jim1.business_id = jim.id
    jim1.service_id = food.id
    jim1.active = true
    jim1.save!
    
    chic = Business.new
    chic.name = "Chick'n Bubbly"
    chic.description = "Oakland"
    chic.phone = ""
    chic.schedule = ""
    chic.street_1 = "117 Oakland Ave"
    chic.street_2 = ""
    chic.city = "Pittsburgh"
    chic.state = "PA"
    chic.zip_code = "15213"
    chic.user_id = allie.id
    chic.active = true
    chic.save!
    sleep 0.2
    chic1 = BusinessService.new
    chic1.business_id = chic.id
    chic1.service_id = food.id
    chic1.active = true
    chic1.save!
    
    kev = Business.new
    kev.name = "Kevin's Deli"
    kev.description = "Oakland"
    kev.phone = ""
    kev.schedule = ""
    kev.street_1 = "101 N Dithridge St"
    kev.street_2 = ""
    kev.city = "Pittsburgh"
    kev.state = "PA"
    kev.zip_code = "15213"
    kev.user_id = allie.id
    kev.active = true
    kev.save!
    sleep 0.2
    kev1 = BusinessService.new
    kev1.business_id = kev.id
    kev1.service_id = food.id
    kev1.active = true
    kev1.save!
    
    ali = Business.new
    ali.name = "Ali Baba Restaurant"
    ali.description = "Oakland"
    ali.phone = ""
    ali.schedule = ""
    ali.street_1 = "404 S Craig St"
    ali.street_2 = ""
    ali.city = "Pittsburgh"
    ali.state = "PA"
    ali.zip_code = "15213"
    ali.user_id = allie.id
    ali.active = true
    ali.save!
    sleep 0.2
    ali1 = BusinessService.new
    ali1.business_id = ali.id
    ali1.service_id = food.id
    ali1.active = true
    ali1.save!
    
    iow = Business.new
    iow.name = "India on Wheels"
    iow.description = "Oakland"
    iow.phone = ""
    iow.schedule = ""
    iow.street_1 = "4422 Bigelow Blvd"
    iow.street_2 = ""
    iow.city = "Pittsburgh"
    iow.state = "PA"
    iow.zip_code = "15213"
    iow.user_id = allie.id
    iow.active = true
    iow.save!
    sleep 0.2
    iow1 = BusinessService.new
    iow1.business_id = iow.id
    iow1.service_id = food.id
    iow1.active = true
    iow1.save!
    
    hem = Business.new
    hem.name = "Hemingway's Cafe"
    hem.description = "Oakland"
    hem.phone = ""
    hem.schedule = ""
    hem.street_1 = "3911 Forbes Ave"
    hem.street_2 = ""
    hem.city = "Pittsburgh"
    hem.state = "PA"
    hem.zip_code = "15213"
    hem.user_id = allie.id
    hem.active = true
    hem.save!
    sleep 0.2
    hem1 = BusinessService.new
    hem1.business_id = hem.id
    hem1.service_id = food.id
    hem1.active = true
    hem1.save!
    
    hem2 = BusinessService.new
    hem2.business_id = hem.id
    hem2.service_id = coffee.id
    hem2.active = true
    hem2.save!
    
    prim = Business.new
    prim.name = "Primanti Bros."
    prim.description = "Oakland"
    prim.phone = ""
    prim.schedule = ""
    prim.street_1 = "3903 Forbes Ave"
    prim.street_2 = ""
    prim.city = "Pittsburgh"
    prim.state = "PA"
    prim.zip_code = "15213"
    prim.user_id = allie.id
    prim.active = true
    prim.save!
    sleep 0.2
    prim1 = BusinessService.new
    prim1.business_id = prim.id
    prim1.service_id = food.id
    prim1.active = true
    prim1.save!
    
    keb = Business.new
    keb.name = "Kebab Factory"
    keb.description = "Oakland"
    keb.phone = ""
    keb.schedule = ""
    keb.street_1 = "121 Oakland Ave"
    keb.street_2 = ""
    keb.city = "Pittsburgh"
    keb.state = "PA"
    keb.zip_code = "15213"
    keb.user_id = allie.id
    keb.active = true
    keb.save!
    sleep 0.2
    keb1 = BusinessService.new
    keb1.business_id = keb.id
    keb1.service_id = food.id
    keb1.active = true
    keb1.save!
    
    say = Business.new
    say.name = "Say Cheese Pizza Co."
    say.description = "Oakland"
    say.phone = ""
    say.schedule = ""
    say.street_1 = "3507 Cable Pl"
    say.street_2 = ""
    say.city = "Pittsburgh"
    say.state = "PA"
    say.zip_code = "15213"
    say.user_id = allie.id
    say.active = true
    say.save!
    sleep 0.2
    say1 = BusinessService.new
    say1.business_id = say.id
    say1.service_id = food.id
    say1.active = true
    say1.save!
    
    hun = Business.new
    hun.name = "Hunan Bar"
    hun.description = "Oakland"
    hun.phone = ""
    hun.schedule = ""
    hun.street_1 = "239 Atwood St"
    hun.street_2 = ""
    hun.city = "Pittsburgh"
    hun.state = "PA"
    hun.zip_code = "15213"
    hun.user_id = allie.id
    hun.active = true
    hun.save!
    sleep 0.2
    hun1 = BusinessService.new
    hun1.business_id = hun.id
    hun1.service_id = food.id
    hun1.active = true
    hun1.save!
    
    five = Business.new
    five.name = "Five Guys Burgers and Fries"
    five.description = "Oakland"
    five.phone = ""
    five.schedule = ""
    five.street_1 = "117 S Bouquet St"
    five.street_2 = ""
    five.city = "Pittsburgh"
    five.state = "PA"
    five.zip_code = "15213"
    five.user_id = allie.id
    five.active = true
    five.save!
    sleep 0.2
    five1 = BusinessService.new
    five1.business_id = five.id
    five1.service_id = food.id
    five1.active = true
    five1.save!
    
    qua = Business.new
    qua.name = "Quaker Steak and Lube"
    qua.description = "Oakland"
    qua.phone = ""
    qua.schedule = ""
    qua.street_1 = "3602 Forbes Ave"
    qua.street_2 = ""
    qua.city = "Pittsburgh"
    qua.state = "PA"
    qua.zip_code = "15213"
    qua.user_id = allie.id
    qua.active = true
    qua.save!
    sleep 0.2
    qua1 = BusinessService.new
    qua1.business_id = qua.id
    qua1.service_id = food.id
    qua1.active = true
    qua1.save!
    
    kor = Business.new
    kor.name = "Korea Garden"
    kor.description = "Oakland"
    kor.phone = ""
    kor.schedule = ""
    kor.street_1 = "414 Semple St"
    kor.street_2 = ""
    kor.city = "Pittsburgh"
    kor.state = "PA"
    kor.zip_code = "15213"
    kor.user_id = allie.id
    kor.active = true
    kor.save!
    sleep 0.2
    kor1 = BusinessService.new
    kor1.business_id = kor.id
    kor1.service_id = food.id
    kor1.active = true
    kor1.save!
    
    thai = Business.new
    thai.name = "Thai Hana"
    thai.description = "Oakland"
    thai.phone = ""
    thai.schedule = ""
    thai.street_1 = "3608 5th Ave"
    thai.street_2 = ""
    thai.city = "Pittsburgh"
    thai.state = "PA"
    thai.zip_code = "15213"
    thai.user_id = allie.id
    thai.active = true
    thai.save!
    sleep 0.2
    thai1 = BusinessService.new
    thai1.business_id = thai.id
    thai1.service_id = food.id
    thai1.active = true
    thai1.save!
    
    eat = Business.new
    eat.name = "Eat Unique"
    eat.description = "Oakland"
    eat.phone = ""
    eat.schedule = ""
    eat.street_1 = "305 S Craig St"
    eat.street_2 = ""
    eat.city = "Pittsburgh"
    eat.state = "PA"
    eat.zip_code = "15213"
    eat.user_id = allie.id
    eat.active = true
    eat.save!
    sleep 0.2
    eat1 = BusinessService.new
    eat1.business_id = eat.id
    eat1.service_id = food.id
    eat1.active = true
    eat1.save!
    
    piz = Business.new
    piz.name = "Pizza Prima"
    piz.description = "Shadyside"
    piz.phone = ""
    piz.schedule = ""
    piz.street_1 = "190 N Craig St"
    piz.street_2 = ""
    piz.city = "Pittsburgh"
    piz.state = "PA"
    piz.zip_code = "15232"
    piz.user_id = allie.id
    piz.active = true
    piz.save!
    sleep 0.2
    piz1 = BusinessService.new
    piz1.business_id = piz.id
    piz1.service_id = food.id
    piz1.active = true
    piz1.save!
    
    am = Business.new
    am.name = "American Apparel"
    am.description = "Shadyside"
    am.phone = ""
    am.schedule = ""
    am.street_1 = "5509 Walnut St"
    am.street_2 = ""
    am.city = "Pittsburgh"
    am.state = "PA"
    am.zip_code = "15232"
    am.user_id = allie.id
    am.active = true
    am.save!
    sleep 0.2
    am1 = BusinessService.new
    am1.business_id = am.id
    am1.service_id = shopping.id
    am1.active = true
    am1.save!
    
    ban = Business.new
    ban.name = "Banana Republic"
    ban.description = "Shadyside"
    ban.phone = ""
    ban.schedule = ""
    ban.street_1 = "2234 Walnut St"
    ban.street_2 = ""
    ban.city = "Pittsburgh"
    ban.state = "PA"
    ban.zip_code = "15232"
    ban.user_id = allie.id
    ban.active = true
    ban.save!
    sleep 0.2
    ban1 = BusinessService.new
    ban1.business_id = ban.id
    ban1.service_id = shopping.id
    ban1.active = true
    ban1.save!
    
    che = Business.new
    che.name = "Cheeks"
    che.description = "Shadyside"
    che.phone = ""
    che.schedule = ""
    che.street_1 = "5406 Walnut St"
    che.street_2 = ""
    che.city = "Pittsburgh"
    che.state = "PA"
    che.zip_code = "15232"
    che.user_id = allie.id
    che.active = true
    che.save!
    sleep 0.2
    che1 = BusinessService.new
    che1.business_id = che.id
    che1.service_id = shopping.id
    che1.active = true
    che1.save!
    
    choi = Business.new
    choi.name = "Choices"
    choi.description = "Shadyside"
    choi.phone = ""
    choi.schedule = ""
    choi.street_1 = "5416 Walnut St"
    choi.street_2 = ""
    choi.city = "Pittsburgh"
    choi.state = "PA"
    choi.zip_code = "15232"
    choi.user_id = allie.id
    choi.active = true
    choi.save!
    sleep 0.2
    choi1 = BusinessService.new
    choi1.business_id = choi.id
    choi1.service_id = shopping.id
    choi1.active = true
    choi1.save!
    
    fran = Business.new
    fran.name = "Francesca's Collections"
    fran.description = "Shadyside"
    fran.phone = ""
    fran.schedule = ""
    fran.street_1 = "5426 Walnut St"
    fran.street_2 = ""
    fran.city = "Pittsburgh"
    fran.state = "PA"
    fran.zip_code = "15232"
    fran.user_id = allie.id
    fran.active = true
    fran.save!
    sleep 0.2
    fran1 = BusinessService.new
    fran1.business_id = fran.id
    fran1.service_id = shopping.id
    fran1.active = true
    fran1.save!
    
    gap = Business.new
    gap.name = "Gap"
    gap.description = "Shadyside"
    gap.phone = ""
    gap.schedule = ""
    gap.street_1 = "5436 Walnut St"
    gap.street_2 = ""
    gap.city = "Pittsburgh"
    gap.state = "PA"
    gap.zip_code = "15232"
    gap.user_id = allie.id
    gap.active = true
    gap.save!
    sleep 0.2
    gap1 = BusinessService.new
    gap1.business_id = gap.id
    gap1.service_id = shopping.id
    gap1.active = true
    gap1.save!
    
    crew = Business.new
    crew.name = "J. Crew"
    crew.description = "Shadyside"
    crew.phone = ""
    crew.schedule = ""
    crew.street_1 = "5433 Walnut St"
    crew.street_2 = ""
    crew.city = "Pittsburgh"
    crew.state = "PA"
    crew.zip_code = "15232"
    crew.user_id = allie.id
    crew.active = true
    crew.save!
    sleep 0.2
    crew1 = BusinessService.new
    crew1.business_id = crew.id
    crew1.service_id = shopping.id
    crew1.active = true
    crew1.save!
    
    moda = Business.new
    moda.name = "Moda"
    moda.description = "Shadyside"
    moda.phone = ""
    moda.schedule = ""
    moda.street_1 = "5401 Walnut St"
    moda.street_2 = ""
    moda.city = "Pittsburgh"
    moda.state = "PA"
    moda.zip_code = "15232"
    moda.user_id = allie.id
    moda.active = true
    moda.save!
    sleep 0.2
    moda1 = BusinessService.new
    moda1.business_id = moda.id
    moda1.service_id = shopping.id
    moda1.active = true
    moda1.save!
    
    pama = Business.new
    pama.name = "Pamar"
    pama.description = "Shadyside"
    pama.phone = ""
    pama.schedule = ""
    pama.street_1 = "5541 Walnut St"
    pama.street_2 = ""
    pama.city = "Pittsburgh"
    pama.state = "PA"
    pama.zip_code = "15232"
    pama.user_id = allie.id
    pama.active = true
    pama.save!
    sleep 0.2
    pama1 = BusinessService.new
    pama1.business_id = pama.id
    pama1.service_id = shopping.id
    pama1.active = true
    pama1.save!
    
    rob = Business.new
    rob.name = "Roberta Weissburg Leathers"
    rob.description = "Shadyside"
    rob.phone = ""
    rob.schedule = ""
    rob.street_1 = "5415 Walnut St"
    rob.street_2 = ""
    rob.city = "Pittsburgh"
    rob.state = "PA"
    rob.zip_code = "15232"
    rob.user_id = allie.id
    rob.active = true
    rob.save!
    sleep 0.2
    rob1 = BusinessService.new
    rob1.business_id = rob.id
    rob1.service_id = shopping.id
    rob1.active = true
    rob1.save!
    
    tal = Business.new
    tal.name = "Talbots"
    tal.description = "Shadyside"
    tal.phone = ""
    tal.schedule = ""
    tal.street_1 = "5428 Walnut St"
    tal.street_2 = ""
    tal.city = "Pittsburgh"
    tal.state = "PA"
    tal.zip_code = "15232"
    tal.user_id = allie.id
    tal.active = true
    tal.save!
    sleep 0.2
    tal1 = BusinessService.new
    tal1.business_id = mex.id
    tal1.service_id = shopping.id
    tal1.active = true
    tal1.save!
    

    
    pic = Business.new
    pic.name = "The Picket Fence"
    pic.description = "Shadyside"
    pic.phone = ""
    pic.schedule = ""
    pic.street_1 = "5425 Walnut St"
    pic.street_2 = ""
    pic.city = "Pittsburgh"
    pic.state = "PA"
    pic.zip_code = "15232"
    pic.user_id = allie.id
    pic.active = true
    pic.save!
    sleep 0.2
    pic1 = BusinessService.new
    pic1.business_id = pic.id
    pic1.service_id = shopping.id
    pic1.active = true
    pic1.save!
    
    kar = Business.new
    kar.name = "Kards Unlimited"
    kar.description = "Shadyside"
    kar.phone = ""
    kar.schedule = ""
    kar.street_1 = "5522 Walnut St"
    kar.street_2 = ""
    kar.city = "Pittsburgh"
    kar.state = "PA"
    kar.zip_code = "15232"
    kar.user_id = allie.id
    kar.active = true
    kar.save!
    sleep 0.2
    kar1 = BusinessService.new
    kar1.business_id = kar.id
    kar1.service_id = shopping.id
    kar1.active = true
    kar1.save!
    
    kar2 = BusinessService.new
    kar2.business_id = kar.id
    kar2.service_id = book.id
    kar2.active = true
    kar2.save!
    
    wil = Business.new
    wil.name = "Williams Sonoma"
    wil.description = "Shadyside"
    wil.phone = ""
    wil.schedule = ""
    wil.street_1 = "5514 Walnut St"
    wil.street_2 = ""
    wil.city = "Pittsburgh"
    wil.state = "PA"
    wil.zip_code = "15232"
    wil.user_id = allie.id
    wil.active = true
    wil.save!
    sleep 0.2
    wil1 = BusinessService.new
    wil1.business_id = wil.id
    wil1.service_id = shopping.id
    wil1.active = true
    wil1.save!
    
    ale = Business.new
    ale.name = "Alex + Ani"
    ale.description = "Shadyside"
    ale.phone = ""
    ale.schedule = ""
    ale.street_1 = "5505 Walnut St"
    ale.street_2 = ""
    ale.city = "Pittsburgh"
    ale.state = "PA"
    ale.zip_code = "15232"
    ale.user_id = allie.id
    ale.active = true
    ale.save!
    sleep 0.2
    ale1 = BusinessService.new
    ale1.business_id = ale.id
    ale1.service_id = shopping.id
    ale1.active = true
    ale1.save!
    
    hen = Business.new
    hen.name = "Henne Jewelers"
    hen.description = "Shadyside"
    hen.phone = ""
    hen.schedule = ""
    hen.street_1 = "5501 Walnut St"
    hen.street_2 = ""
    hen.city = "Pittsburgh"
    hen.state = "PA"
    hen.zip_code = "15232"
    hen.user_id = allie.id
    hen.active = true
    hen.save!
    sleep 0.2
    hen1 = BusinessService.new
    hen1.business_id = hen.id
    hen1.service_id = shopping.id
    hen1.active = true
    hen1.save!
    
    pan = Business.new
    pan.name = "Pandora"
    pan.description = "Shadyside"
    pan.phone = ""
    pan.schedule = ""
    pan.street_1 = "5424 Walnut St"
    pan.street_2 = ""
    pan.city = "Pittsburgh"
    pan.state = "PA"
    pan.zip_code = "15232"
    pan.user_id = allie.id
    pan.active = true
    pan.save!
    sleep 0.2
    pan1 = BusinessService.new
    pan1.business_id = pan.id
    pan1.service_id = shopping.id
    pan1.active = true
    pan1.save!
    
    rite = Business.new
    rite.name = "Rite Aid"
    rite.description = "Shadyside"
    rite.phone = ""
    rite.schedule = ""
    rite.street_1 = "5504 Walnut St"
    rite.street_2 = ""
    rite.city = "Pittsburgh"
    rite.state = "PA"
    rite.zip_code = "15232"
    rite.user_id = allie.id
    rite.active = true
    rite.save!
    sleep 0.2
    rite1 = BusinessService.new
    rite1.business_id = rite.id
    rite1.service_id = shopping.id
    rite1.active = true
    rite1.save!
    
    rite2 = BusinessService.new
    rite2.business_id = rite.id
    rite2.service_id = pharm.id
    rite2.active = true
    rite2.save!
    
    sch = Business.new
    sch.name = "Schiller's Pharmacy and Cosmetique"
    sch.description = "Shadyside"
    sch.phone = ""
    sch.schedule = ""
    sch.street_1 = "811 South Aiken Ave"
    sch.street_2 = ""
    sch.city = "Pittsburgh"
    sch.state = "PA"
    sch.zip_code = "15232"
    sch.user_id = allie.id
    sch.active = true
    sch.save!
    sleep 0.2
    sch1 = BusinessService.new
    sch1.business_id = sch.id
    sch1.service_id = shopping.id
    sch1.active = true
    sch1.save!
    
    sch2 = BusinessService.new
    sch2.business_id = sch.id
    sch2.service_id = pharm.id
    sch2.active = true
    sch2.save!
    
    foot = Business.new
    foot.name = "Footloose"
    foot.description = "Shadyside"
    foot.phone = ""
    foot.schedule = ""
    foot.street_1 = "736 Bellefonte St"
    foot.street_2 = ""
    foot.city = "Pittsburgh"
    foot.state = "PA"
    foot.zip_code = "15232"
    foot.user_id = allie.id
    foot.active = true
    foot.save!
    sleep 0.2
    foot1 = BusinessService.new
    foot1.business_id = foot.id
    foot1.service_id = shopping.id
    foot1.active = true
    foot1.save!
    
    ten = Business.new
    ten.name = "Ten Toes"
    ten.description = "Shadyside"
    ten.phone = ""
    ten.schedule = ""
    ten.street_1 = "5502 Walnut St"
    ten.street_2 = ""
    ten.city = "Pittsburgh"
    ten.state = "PA"
    ten.zip_code = "15232"
    ten.user_id = allie.id
    ten.active = true
    ten.save!
    sleep 0.2
    ten1 = BusinessService.new
    ten1.business_id = ten.id
    ten1.service_id = shopping.id
    ten1.active = true
    ten1.save!
    
    ath = Business.new
    ath.name = "Athleta"
    ath.description = "Shadyside"
    ath.phone = ""
    ath.schedule = ""
    ath.street_1 = "5430 Walnut St"
    ath.street_2 = ""
    ath.city = "Pittsburgh"
    ath.state = "PA"
    ath.zip_code = "15232"
    ath.user_id = allie.id
    ath.active = true
    ath.save!
    sleep 0.2
    ath1 = BusinessService.new
    ath1.business_id = ath.id
    ath1.service_id = shopping.id
    ath1.active = true
    ath1.save!
    
    gnc = Business.new
    gnc.name = "GNC"
    gnc.description = "Shadyside"
    gnc.phone = ""
    gnc.schedule = ""
    gnc.street_1 = "5530 Walnut St"
    gnc.street_2 = ""
    gnc.city = "Pittsburgh"
    gnc.state = "PA"
    gnc.zip_code = "15232"
    gnc.user_id = allie.id
    gnc.active = true
    gnc.save!
    sleep 0.2
    gnc1 = BusinessService.new
    gnc1.business_id = gnc.id
    gnc1.service_id = shopping.id
    gnc1.active = true
    gnc1.save!
    
    lu = Business.new
    lu.name = "Lulu Lemon Athletica"
    lu.description = "Shadyside"
    lu.phone = ""
    lu.schedule = ""
    lu.street_1 = "5520 Walnut St"
    lu.street_2 = ""
    lu.city = "Pittsburgh"
    lu.state = "PA"
    lu.zip_code = "15232"
    lu.user_id = allie.id
    lu.active = true
    lu.save!
    sleep 0.2
    lu1 = BusinessService.new
    lu1.business_id = lu.id
    lu1.service_id = shopping.id
    lu1.active = true
    lu1.save!
    
    tenn = Business.new
    tenn.name = "Tennis Village"
    tenn.description = "Shadyside"
    tenn.phone = ""
    tenn.schedule = ""
    tenn.street_1 = "5419 Walnut St"
    tenn.street_2 = ""
    tenn.city = "Pittsburgh"
    tenn.state = "PA"
    tenn.zip_code = "15232"
    tenn.user_id = allie.id
    tenn.active = true
    tenn.save!
    sleep 0.2
    tenn1 = BusinessService.new
    tenn1.business_id = tenn.id
    tenn1.service_id = shopping.id
    tenn1.active = true
    tenn1.save!
    
    tru = Business.new
    tru.name = "True Runner"
    tru.description = "Shadyside"
    tru.phone = ""
    tru.schedule = ""
    tru.street_1 = "5407 Walnut St"
    tru.street_2 = ""
    tru.city = "Pittsburgh"
    tru.state = "PA"
    tru.zip_code = "15232"
    tru.user_id = allie.id
    tru.active = true
    tru.save!
    sleep 0.2
    tru1 = BusinessService.new
    tru1.business_id = tru.id
    tru1.service_id = shopping.id
    tru1.active = true
    tru1.save!
    
    app = Business.new
    app.name = "Apple Store"
    app.description = "Shadyside"
    app.phone = ""
    app.schedule = ""
    app.street_1 = "5508 Walnut St"
    app.street_2 = ""
    app.city = "Pittsburgh"
    app.state = "PA"
    app.zip_code = "15232"
    app.user_id = allie.id
    app.active = true
    app.save!
    sleep 0.2
    app1 = BusinessService.new
    app1.business_id = app.id
    app1.service_id = shopping.id
    app1.active = true
    app1.save!
    
    tav = Business.new
    tav.name = "1947 Tavern"
    tav.description = "Shadyside"
    tav.phone = ""
    tav.schedule = ""
    tav.street_1 = "5744 1/2 Ellsworth Ave"
    tav.street_2 = ""
    tav.city = "Pittsburgh"
    tav.state = "PA"
    tav.zip_code = "15232"
    tav.user_id = allie.id
    tav.active = true
    tav.save!
    sleep 0.2
    tav1 = BusinessService.new
    tav1.business_id = tav.id
    tav1.service_id = food.id
    tav1.active = true
    tav1.save!
    
    mar = Business.new
    mar.name = "Mario's Eastside Saloon"
    mar.description = "Shadyside"
    mar.phone = ""
    mar.schedule = ""
    mar.street_1 = "5442 Walnut St"
    mar.street_2 = ""
    mar.city = "Pittsburgh"
    mar.state = "PA"
    mar.zip_code = "15232"
    mar.user_id = allie.id
    mar.active = true
    mar.save!
    sleep 0.2
    mar1 = BusinessService.new
    mar1.business_id = mar.id
    mar1.service_id = food.id
    mar1.active = true
    mar1.save!
    
    mer = Business.new
    mer.name = "Mercurio's Gelato & Pizza"
    mer.description = "Shadyside"
    mer.phone = ""
    mer.schedule = ""
    mer.street_1 = "5523 Walnut St"
    mer.street_2 = ""
    mer.city = "Pittsburgh"
    mer.state = "PA"
    mer.zip_code = "15232"
    mer.user_id = allie.id
    mer.active = true
    mer.save!
    sleep 0.2
    mer1 = BusinessService.new
    mer1.business_id = mer.id
    mer1.service_id = food.id
    mer1.active = true
    mer1.save!
    
    pame = Business.new
    pame.name = "Pamela's Diner"
    pame.description = "Shadyside"
    pame.phone = ""
    pame.schedule = ""
    pame.street_1 = "5523 Walnut St"
    pame.street_2 = ""
    pame.city = "Pittsburgh"
    pame.state = "PA"
    pame.zip_code = "15232"
    pame.user_id = allie.id
    pame.active = true
    pame.save!
    sleep 0.2
    pame1 = BusinessService.new
    pame1.business_id = pame.id
    pame1.service_id = food.id
    pame1.active = true
    pame1.save!
    
    sha = Business.new
    sha.name = "Shady Grove"
    sha.description = "Shadyside"
    sha.phone = ""
    sha.schedule = ""
    sha.street_1 = "809 Bellefonte St"
    sha.street_2 = ""
    sha.city = "Pittsburgh"
    sha.state = "PA"
    sha.zip_code = "15232"
    sha.user_id = allie.id
    sha.active = true
    sha.save!
    sleep 0.2
    sha1 = BusinessService.new
    sha1.business_id = sha.id
    sha1.service_id = food.id
    sha1.active = true
    sha1.save!
    
    ste = Business.new
    ste.name = "Steel Cactus"
    ste.description = "Shadyside"
    ste.phone = ""
    ste.schedule = ""
    ste.street_1 = "5505 Walnut St"
    ste.street_2 = ""
    ste.city = "Pittsburgh"
    ste.state = "PA"
    ste.zip_code = "15232"
    ste.user_id = allie.id
    ste.active = true
    ste.save!
    sleep 0.2
    ste1 = BusinessService.new
    ste1.business_id = ste.id
    ste1.service_id = food.id
    ste1.active = true
    ste1.save!
    
    sus = Business.new
    sus.name = "Sushi Too Restaurant"
    sus.description = "Shadyside"
    sus.phone = ""
    sus.schedule = ""
    sus.street_1 = "5432 Walnut St"
    sus.street_2 = ""
    sus.city = "Pittsburgh"
    sus.state = "PA"
    sus.zip_code = "15232"
    sus.user_id = allie.id
    sus.active = true
    sus.save!
    sleep 0.2
    sus1 = BusinessService.new
    sus1.business_id = sus.id
    sus1.service_id = food.id
    sus1.active = true
    sus1.save!
    
    tha = Business.new
    tha.name = "Thai Place Restaurant"
    tha.description = "Shadyside"
    tha.phone = ""
    tha.schedule = ""
    tha.street_1 = "5528 Walnut St"
    tha.street_2 = ""
    tha.city = "Pittsburgh"
    tha.state = "PA"
    tha.zip_code = "15232"
    tha.user_id = allie.id
    tha.active = true
    tha.save!
    sleep 0.2
    tha1 = BusinessService.new
    tha1.business_id = tha.id
    tha1.service_id = food.id
    tha1.active = true
    tha1.save!
    
    yard = Business.new
    yard.name = "The Yard"
    yard.description = "Shadyside"
    yard.phone = ""
    yard.schedule = ""
    yard.street_1 = "736 Bellefonte St"
    yard.street_2 = ""
    yard.city = "Pittsburgh"
    yard.state = "PA"
    yard.zip_code = "15232"
    yard.user_id = allie.id
    yard.active = true
    yard.save!
    sleep 0.2
    yard1 = BusinessService.new
    yard1.business_id = yard.id
    yard1.service_id = food.id
    yard1.active = true
    yard1.save!
    
    wil = Business.new
    wil.name = "William Penn Tavern"
    wil.description = "Shadyside"
    wil.phone = ""
    wil.schedule = ""
    wil.street_1 = "739 Bellefonte St"
    wil.street_2 = ""
    wil.city = "Pittsburgh"
    wil.state = "PA"
    wil.zip_code = "15232"
    wil.user_id = allie.id
    wil.active = true
    wil.save!
    sleep 0.2
    wil1 = BusinessService.new
    wil1.business_id = wil.id
    wil1.service_id = food.id
    wil1.active = true
    wil1.save!
    
    jit = Business.new
    jit.name = "Jitters Cafe"
    jit.description = "Shadyside"
    jit.phone = ""
    jit.schedule = ""
    jit.street_1 = "5541 Walnut St"
    jit.street_2 = ""
    jit.city = "Pittsburgh"
    jit.state = "PA"
    jit.zip_code = "15232"
    jit.user_id = allie.id
    jit.active = true
    jit.save!
    sleep 0.2
    jit1 = BusinessService.new
    jit1.business_id = jit.id
    jit1.service_id = food.id
    jit1.active = true
    jit1.save!
    
    coff = Business.new
    coff.name = "Coffee Tree Roasters"
    coff.description = "Shadyside"
    coff.phone = ""
    coff.schedule = ""
    coff.street_1 = "5524 Walnut St"
    coff.street_2 = ""
    coff.city = "Pittsburgh"
    coff.state = "PA"
    coff.zip_code = "15232"
    coff.user_id = allie.id
    coff.active = true
    coff.save!
    sleep 0.2
    coff1 = BusinessService.new
    coff1.business_id = coff.id
    coff1.service_id = food.id
    coff1.active = true
    coff1.save!
    
    coff2 = BusinessService.new
    coff2.business_id = coff.id
    coff2.service_id = coffee.id
    coff2.active = true
    coff2.save!
    
    star = Business.new
    star.name = "Starbucks"
    star.description = "Shadyside"
    star.phone = ""
    star.schedule = ""
    star.street_1 = "730 Copeland St"
    star.street_2 = ""
    star.city = "Pittsburgh"
    star.state = "PA"
    star.zip_code = "15232"
    star.user_id = allie.id
    star.active = true
    star.save!
    sleep 0.2
    star1 = BusinessService.new
    star1.business_id = star.id
    star1.service_id = food.id
    star1.active = true
    star1.save!
    
    star2 = BusinessService.new
    star2.business_id = star.id
    star2.service_id = coffee.id
    star2.active = true
    star2.save!
    
    mark = Business.new
    mark.name = "Shadyside Markey & Gourmet Deli"
    mark.description = "Shadyside"
    mark.phone = ""
    mark.schedule = ""
    mark.street_1 = "5414 Walnut St"
    mark.street_2 = ""
    mark.city = "Pittsburgh"
    mark.state = "PA"
    mark.zip_code = "15232"
    mark.user_id = allie.id
    mark.active = true
    mark.save!
    sleep 0.2
    mark1 = BusinessService.new
    mark1.business_id = mark.id
    mark1.service_id = food.id
    mark1.active = true
    mark1.save!
    
    mark2 = BusinessService.new
    mark2.business_id = mark.id
    mark2.service_id = shopping.id
    mark2.active = true
    mark2.save!
    
    pnc = Business.new
    pnc.name = "PNC Bank"
    pnc.description = "Shadyside"
    pnc.phone = ""
    pnc.schedule = ""
    pnc.street_1 = "5601 Walnut St"
    pnc.street_2 = ""
    pnc.city = "Pittsburgh"
    pnc.state = "PA"
    pnc.zip_code = "15232"
    pnc.user_id = allie.id
    pnc.active = true
    pnc.save!
    sleep 0.2
    pnc1 = BusinessService.new
    pnc1.business_id = pnc.id
    pnc1.service_id = atm.id
    pnc1.active = true
    pnc1.save!
    
    pnc2 = BusinessService.new
    pnc2.business_id = pnc.id
    pnc2.service_id = bank.id
    pnc2.active = true
    pnc2.save!
    
    


  end
end