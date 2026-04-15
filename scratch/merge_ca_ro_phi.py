import json
import os

FILE_PATH = r'c:\Users\Hai\.gemini\antigravity\scratch\nau-gi-day-pwa\src\lib\recipes_data.json'

new_recipes_raw = [
  {"id":"ca-ro-phi-001","name":"Cá rô phi kho tộ","region":"toan-quoc","difficulty":"de","ingredients":{"main":["1 con cá rô phi 600g","2 thìa canh nước mắm","1 thìa canh đường","1 thìa cà phê tiêu","1 củ hành khô"],"optional":["Mỡ nước","Hành lá","Ớt hiểm"]},"steps":["Sơ chế cá sạch, khứa nhẹ hai bên mình và ướp with nước mắm, đường, tiêu trong 15 phút.","Đun nóng tộ đất, tráng lớp mỡ nước mỏng rồi xếp cá vào, đổ nước ướp còn lại lên trên.","Kho lửa nhỏ liu riu khoảng 25 phút đến khi nước sốt sệt lại và cá thấm đều gia vị.","Rắc hành lá và ớt hiểm, tắt bếp, dùng nóng with cơm trắng."],"tags":["braised","traditional","savory","comfort-food","family-meal"],"description":"Cá kho tộ đậm đà, thịt chắc ngọt thấm đẫm nước sốt keo sánh thơm nồng tiêu.","tips":"Dùng tộ đất và mỡ nước giúp món ăn giữ nhiệt lâu hơn và béo ngậy đặc trưng.","calories":260,"time":40},
  {"id":"ca-ro-phi-002","name":"Cá rô phi chiên giòn","region":"toan-quoc","difficulty":"de","ingredients":{"main":["1 con cá rô phi 700g","1 thìa cà phê muối","1 thìa cà phê bột ngọt","Dầu ăn để chiên"],"optional":["Tương ớt","Tương cà","Xà lách","Dưa chuột"]},"steps":["Làm sạch cá, khứa chéo đều hai mặt, ướp muối và bột ngọt trong 10 phút.","Làm nóng dầu ăn, chiên cá ngập lửa vừa đến khi da vàng giòn, vớt ra giấy thấm dầu.","Cắt cá thành miếng vừa ăn, bày ra đĩa kèm xà lách và dưa chuột.","Dùng nóng kèm tương ớt hoặc tương cà tùy thích."],"tags":["deep-fried","crispy","quick","classic","appetizing"],"description":"Cá chiên vàng ruộm, da giòn rụm bên ngoài, thịt trắng mềm ngọt bên trong.","tips":"Chiên ở lửa vừa và lật nhẹ nhàng để cá không bị vỡ, dầu thật nóng trước khi thả cá.","calories":320,"time":25},
  {"id":"ca-ro-phi-003","name":"Cá rô phi hấp xì dầu","region":"toan-quoc","difficulty":"de","ingredients":{"main":["1 con cá rô phi 500g","3 thìa canh xì dầu","1 thìa canh đường","Gừng tươi thái sợi","Hành lá"],"optional":["Ớt chỉ thiên","Dầu hào","Rau mùi"]},"steps":["Vệ sinh cá sạch sẽ, đặt vào đĩa hấp có lót vài lát gừng.","Trộn đều xì dầu, đường và dầu hào, rưới đều lên thân cá.","Hấp cách thủy lửa lớn khoảng 12-15 phút đến khi thịt cá chín mềm.","Lấy ra rắc gừng sợi, hành lá, ớt và dầu ăn nóng lên trên, thưởng thức ngay."],"tags":["steamed","light","healthy","soy-sauce","umami"],"description":"Cá hấp giữ trọn vị ngọt tự nhiên, thấm đẫm xì dầu mặn ngọt hài hòa, thanh mát dễ ăn.","tips":"Không hấp quá lâu để thịt cá không bị khô, rót dầu sôi lên hành gừng sẽ dậy mùi thơm.","calories":180,"time":25},
  {"id":"ca-ro-phi-004","name":"Canh chua cá rô phi","region":"mien-nam","difficulty":"de","ingredients":{"main":["400g cá rô phi cắt khúc","50g me tươi","1 quả cà chua","50g đậu bắp","50g giá đỗ","2 thìa canh đường","1 thìa canh nước mắm"],"optional":["Ngò gai","Hành phi","Rau nhút"]},"steps":["Nấu me with nước sôi, dằm nát và lọc lấy nước cốt chua.","Đun sôi nước dùng, thả cá vào nấu chín nhẹ rồi vớt ra để riêng.","Cho cà chua, đậu bắp vào nồi, nêm đường và nước mắm vừa miệng.","Thả cá và giá đỗ vào lại, tắt bếp, rắc ngò gai và hành phi lên trên."],"tags":["sour-soup","refreshing","southern","healthy","quick-meal"],"description":"Nước canh chua thanh mát, vị me chua dịu hòa quyện thịt cá ngọt mềm cùng rau củ giòn tươi.","tips":"Cho cá vào nồi ở bước cuối để thịt không bị nát và giữ được độ săn chắc.","calories":190,"time":30},
  {"id":"ca-ro-phi-005","name":"Cá rô phi rim mặn","region":"mien-trung","difficulty":"de","ingredients":{"main":["500g cá rô phi nhỏ","3 thìa canh nước mắm","1 thìa canh đường","1 thìa cà phê tiêu","Hành tím băm"],"optional":["Ớt tươi","Mỡ heo","Dưa món"]},"steps":["Cá làm sạch, ướp nước mắm, đường, hành tím và tiêu trong 20 phút.","Đun nóng nồi, xếp cá vào rim lửa nhỏ đến khi nước bắt đầu sánh.","Rim thêm 10 phút, đảo nhẹ cho cá thấm đều vị mặn ngọt.","Rắc tiêu và ớt, tắt bếp, dùng kèm cơm nóng và dưa món."],"tags":["simmered","salty-sweet","central","rustic","rice-companion"],"description":"Món rim mặn đưa cơm, thịt cá thấm đẫm gia vị đậm đà, thơm nồng tiêu hành.","tips":"Rim lửa nhỏ và không đảo nhiều để cá giữ nguyên hình dáng và không bị nát.","calories":210,"time":35},
  {"id":"ca-ro-phi-006","name":"Lẩu cá rô phi măng chua","region":"mien-bac","difficulty":"trung-binh","ingredients":{"main":["1kg cá rô phi cắt lát","200g măng chua ngâm","1 quả cà chua","2 thìa mẻ lọc","500ml nước dùng xương","Nấm hương"],"optional":["Bún tươi","Rau muống","Hành phi"]},"steps":["Luộc sơ măng chua, rửa sạch, thái miếng vừa ăn để giảm vị hăng.","Phi hành khô, xào măng và cà chua, đổ nước dùng vào đun sôi.","Nêm nước mắm, mẻ, đường cho vừa vị, thả nấm hương vào.","Khi nước lẩu sôi, nhúng từng lát cá chín tái, ăn kèm bún và rau."],"tags":["hotpot","fermented-bamboo","sour","communal","warming"],"description":"Nước lẩu chua thanh từ măng và mẻ, cá ngọt mềm tan trong miệng, thích hợp cho bữa tiệc gia đình.","tips":"Măng cần luộc kỹ 2 lần nước để đảm bảo an toàn, nước lẩu nêm hơi đậm để nhúng rau không bị nhạt.","calories":220,"time":50},
  {"id":"ca-ro-phi-007","name":"Cá rô phi nướng muối ớt","region":"mien-nam","difficulty":"trung-binh","ingredients":{"main":["1 con cá rô phi 800g","3 thìa canh muối hạt","2 quả ớt sừng","1 thìa canh dầu ăn","Hành khô"],"optional":["Rau sống","Bánh tráng","Muối tiêu chanh"]},"steps":["Làm sạch cá, khứa sâu hai bên mình cá.","Giã nhuyễn muối, ớt và dầu ăn thành hỗn hợp sệt, ướp đều vào trong và ngoài cá trong 30 phút.","Nướng cá trên than hoa hoặc lò nướng ở 200 độ C trong 25 phút, lật đều tay.","Dọn cá ra đĩa, ăn kèm rau sống, bánh tráng nướng và muối tiêu chanh."],"tags":["grilled","spicy","southern","smoky","street-food"],"description":"Da cá nướng giòn rụm, thịt bên trong ngọt ẩm, vị muối ớt cay nồng kích thích vị giác.","tips":"Phết thêm lớp dầu mỏng khi nướng để da cá không bị khô, than hoa giúp cá thơm hơn lò điện.","calories":240,"time":45},
  {"id":"ca-ro-phi-008","name":"Cá rô phi sốt cà chua","region":"toan-quoc","difficulty":"de","ingredients":{"main":["400g cá rô phi cắt khúc","3 quả cà chua chín","2 thìa nước mắm","1 thìa đường","1 củ hành khô","Tỏi băm"],"optional":["Hành lá","Ớt tươi","Rau mùi"]},"steps":["Cá ướp chút muối và tiêu, chiên vàng hai mặt rồi vớt ra.","Phi thơm hành tỏi, xào cà chua chín nhừ, nêm nước mắm và đường.","Thả cá vào nồi sốt, rim nhỏ lửa 5 phút cho thấm vị.","Rắc hành lá và ớt, tắt bếp, dùng nóng with cơm trắng."],"tags":["pan-fried","tomato-sauce","tangy","family-meal","classic"],"description":"Cá giòn nhẹ hòa quyện sốt cà chua chua ngọt đậm đà, màu sắc bắt mắt và hương vị quen thuộc.","tips":"Chọn cà chua chín đỏ mềm để sốt sánh mịn, rim nhỏ lửa để sốt không bị cháy đáy.","calories":230,"time":30},
  {"id":"ca-ro-phi-009","name":"Cháo cá rô phi","region":"toan-quoc","difficulty":"de","ingredients":{"main":["300g gạo tẻ","400g cá rô phi","50g gừng thái sợi","1 lít nước dùng","Hành khô phi thơm","Thì là"],"optional":["Hành lá","Tiêu xay","Quẩy giòn"]},"steps":["Vo sạch gạo, nấu cháo nhừ with nước dùng trong.","Luộc chín cá, gỡ lấy thịt nạc, xương lọc bỏ.","Phi hành khô, xào săn thịt cá, cho vào nồi cháo đun sôi nhẹ.","Nêm gia vị vừa ăn, rắc gừng, thì là, hành lá và tiêu, múc ra tô dùng with quẩy."],"tags":["porridge","nutritious","comforting","easy-digest","breakfast"],"description":"Cháo trắng dẻo mịn quyện thịt cá ngọt lành, ấm bụng và giàu dinh dưỡng cho cả gia đình.","tips":"Xào thịt cá with hành phi trước khi cho vào cháo giúp khử tanh và tăng hương vị đáng kể.","calories":290,"time":45},
  {"id":"ca-ro-phi-010","name":"Cá rô phi kho tiêu","region":"toan-quoc","difficulty":"de","ingredients":{"main":["500g cá rô phi cắt khoanh","2 thìa nước mắm","1 thìa đường","2 thìa tiêu đen xay","1 củ hành tím","Nước dừa tươi"],"optional":["Ớt sừng","Mỡ nước","Dưa món"]},"steps":["Cá ướp nước mắm, đường, hành tím băm và tiêu trong 20 phút.","Thắng đường làm màu caramen nhẹ, xếp cá vào nồi, đổ nước dừa ngập 1/3 cá.","Kho lửa nhỏ đến khi nước sánh đặc, cá thấm đều vị mặn ngọt.","Rắc thêm tiêu và ớt, tắt bếp, dùng kèm cơm và dưa món."],"tags":["braised","peppery","coconut-milk","rich","savory"],"description":"Tiêu đen thơm nồng kết hợp nước dừa béo ngậy tạo nên món kho đậm vị, ăn là ghiền.","tips":"Thêm chút mỡ nước hoặc nước cốt dừa cuối cùng giúp món ăn bóng đẹp và thơm hơn.","calories":280,"time":40},
  {"id":"ca-ro-phi-011","name":"Gỏi cá rô phi thính","region":"mien-bac","difficulty":"kho","ingredients":{"main":["300g phi lê cá rô phi tươi","50g thính gạo rang","30g dừa nạo sợi","Rau thơm các loại","Chanh, ớt, tỏi"],"optional":["Bánh đa nướng","Dưa leo","Xoài xanh"]},"steps":["Phi lê cá thái lát mỏng, trộn nhanh with nước cốt chanh và ớt để tái chanh.","Thêm dừa nạo, thính rang, rau thơm thái nhỏ vào tô lớn.","Nêm đường, nước mắm, chanh cho vị chua ngọt hài hòa, trộn đều tay.","Ăn kèm bánh đa nướng giòn và rau sống, chấm nước mắm pha đặc."],"tags":["salad","raw","citrus","crunchy","northern"],"description":"Món gỏi tươi mát with thịt cá tái chanh dai giòn, hòa quyện vị béo dừa và thơm ngậy thính rang.","tips":"Cá phải thật tươi và được xử lý vệ sinh kỹ, dao sắc thái lát mỏng đều để trộn nhanh.","calories":200,"time":30},
  {"id":"ca-ro-phi-012","name":"Cá rô phi kho dưa","region":"mien-bac","difficulty":"de","ingredients":{"main":["500g cá rô phi cắt khúc","200g dưa cải muối chua","2 quả cà chua","1 thìa mẻ","1 thìa nước mắm","Hành khô"],"optional":["Thì là","Hành lá","Ớt"]},"steps":["Dưa cải rửa sạch, vắt ráo nước, xào thơm with hành khô.","Cho cà chua thái múi cau vào xào cùng, thêm nước và mẻ đun sôi.","Xếp cá vào nồi, om lửa nhỏ 15 phút cho cá thấm vị chua ngọt.","Rắc thì là, hành lá, ớt rồi bắc ra, dùng nóng with cơm."],"tags":["braised","pickled-vegetable","traditional","sour-savory","rustic"],"description":"Vị chua dịu của dưa cải muối hòa quyện thịt cá ngọt mềm, món ăn dân dã vô cùng đưa cơm.","tips":"Chọn dưa cải muối vừa chua không quá mặn, om lửa nhỏ để thịt cá không bị bở nát.","calories":210,"time":35},
  {"id":"ca-ro-phi-013","name":"Cá rô phi chiên mắm","region":"mien-trung","difficulty":"de","ingredients":{"main":["400g cá rô phi nhỏ","3 thìa nước mắm","2 thìa đường","Tỏi băm","Ớt băm"],"optional":["Hành phi","Rau sống","Cơm trắng"]},"steps":["Cá làm sạch, chiên vàng giòn hai mặt, vớt ra để ráo dầu.","Phi thơm tỏi và ớt, đổ nước mắm và đường vào đun sôi đến khi sánh sệt.","Thả cá vào nồi mắm, đảo nhanh tay cho mắm bám đều khắp thân cá.","Tắt bếp, rắc hành phi, ăn ngay khi còn nóng giòn."],"tags":["fried","fish-sauce","caramelized","savory","central"],"description":"Cá giòn rụm phủ lớp mắm tỏi ớt caramel bóng đẹp, vị mặn ngọt đậm đà khó cưỡng.","tips":"Đun mắm đến khi sệt vừa phải, cho cá vào đảo nhanh để cá không bị mềm nhũn.","calories":270,"time":25},
  {"id":"ca-ro-phi-014","name":"Canh cá rô phi nấu thì là","region":"mien-bac","difficulty":"de","ingredients":{"main":["300g phi lê cá rô phi","1 bó rau thì là","500ml nước dùng","2 thìa nước mắm","1 củ hành khô"],"optional":["Hành lá","Ớt","Gừng"]},"steps":["Phi lê cá thái miếng, ướp chút nước mắm và tiêu.","Phi hành khô thơm, đổ nước dùng đun sôi, thả cá vào nấu chín.","Nêm nước mắm, đường cho vừa miệng, cho rau thì là thái nhỏ vào đảo nhanh.","Tắt bếp ngay, múc ra tô rắc hành lá và ớt, dùng nóng."],"tags":["soup","dill","light","quick","traditional"],"description":"Hương thì là đặc trưng quyện with nước dùng trong vắt và thịt cá ngọt lành, thanh mát dễ chịu.","tips":"Thì là cho vào cuối cùng, đảo nhẹ và tắt bếp ngay để giữ màu xanh và hương thơm đặc trưng.","calories":160,"time":20},
  {"id":"ca-ro-phi-015","name":"Cá rô phi om chuối đậu","region":"mien-bac","difficulty":"trung-binh","ingredients":{"main":["400g cá rô phi cắt khúc","2 quả chuối xanh","1 bìa đậu phụ","1 thìa mẻ","1 thìa nước mắm","Mắm tôm"],"optional":["Tía tô","Hành lá","Ớt"]},"steps":["Chuối xanh gọt vỏ, ngâm nước muối loãng, đậu phụ chiên vàng cắt miếng.","Phi thơm hành, cho mắm tôm và mẻ vào xào, đổ nước dùng đun sôi.","Thả cá, chuối, đậu vào om lửa nhỏ 20 phút đến khi chuối mềm.","Rắc tía tô, hành lá, tắt bếp, ăn kèm cơm nóng."],"tags":["braised","banana","tofu","fermented","hearty"],"description":"Vị béo bùi của đậu và chuối quyện with cá ngọt mềm, nước om sánh đặc đậm chất miền Bắc.","tips":"Chuối phải ngâm nước chua nhẹ để không bị thâm, om nhỏ lửa giúp đậu không bị vỡ.","calories":250,"time":40},
  {"id":"ca-ro-phi-016","name":"Cá rô phi hấp sả","region":"mien-nam","difficulty":"de","ingredients":{"main":["1 con cá rô phi 600g","5 cây sả đập dập","1 thìa nước tương","1 thìa đường","Gừng tươi","Hành lá"],"optional":["Ớt hiểm","Dầu ăn","Rau sống"]},"steps":["Cá rửa sạch, khứa nhẹ, ướp nước tương, đường và gừng đập dập.","Xếp sả lót dưới đĩa hấp, đặt cá lên trên, rưới đều phần ướp.","Hấp cách thủy lửa lớn 15 phút đến khi thịt cá chín mềm.","Lấy ra rắc hành lá, gừng sợi, rưới dầu nóng lên, thưởng thức with rau sống."],"tags":["steamed","lemongrass","aromatic","light","southern"],"description":"Hương sả thơm nồng quyện vào từng thớ cá hấp mềm ngọt, món ăn thanh đạm tốt cho sức khỏe.","tips":"Sả lót đáy đĩa giúp cá không dính và thấm hương thơm từ dưới lên trong quá trình hấp.","calories":190,"time":25},
  {"id":"ca-ro-phi-017","name":"Bún cá rô phi","region":"mien-bac","difficulty":"trung-binh","ingredients":{"main":["500g cá rô phi phi lê","500g bún tươi","1 lít nước dùng xương","1 quả cà chua","2 thìa mắm nêm","Hành tây"],"optional":["Rau sống","Hành phi","Ớt băm","Mắm tôm"]},"steps":["Hầm xương lấy nước dùng trong, nêm muối nhạt.","Phi lê cá ướp gia vị, chiên vàng hoặc hấp chín, xé nhỏ hoặc để nguyên miếng.","Phi hành tây, xào cà chua, đổ vào nồi nước dùng, nêm mắm nêm cho dậy mùi.","Trụng bún, xếp cá vào tô, chan nước dùng, thêm rau sống và hành phi."],"tags":["noodle-soup","savory","umami","street-food","filling"],"description":"Nước dùng ngọt thanh hòa quyện mắm nêm đặc trưng, cá dai ngọt cùng sợi bún mềm mại hấp dẫn.","tips":"Nước dùng cần trong và ngọt tự nhiên, mắm nêm pha vừa phải để không lấn át vị tươi của cá.","calories":350,"time":50},
  {"id":"ca-ro-phi-018","name":"Cá rô phi xào lăn","region":"mien-nam","difficulty":"trung-binh","ingredients":{"main":["400g phi lê cá rô phi","1 hộp nước cốt dừa nhỏ","2 thìa bột cà ri","1 củ sả đập dập","Hành khô, tỏi","Rau ngổ"],"optional":["Ớt sừng","Bánh mì","Cà chua"]},"steps":["Phi lê cá cắt miếng vuông, ướp bột cà ri, sả băm, hành tỏi 20 phút.","Phi thơm sả cây, xào cá săn lại, đổ nước cốt dừa vào đun nhỏ lửa.","Nêm muối, đường cho vừa miệng, đun đến khi nước sánh đặc lại.","Rắc rau ngổ, ớt sừng, tắt bếp, ăn kèm bánh mì hoặc cơm."],"tags":["stir-fried","curry","coconut","aromatic","southern"],"description":"Nước cốt dừa béo ngậy quyện hương cà ri và sả, cá mềm ngọt thấm đẫm gia vị đậm chất Nam Bộ.","tips":"Đảo cá nhẹ tay để không nát, nước cốt dừa nên cho vào sau khi cá se mặt để giữ độ trắng mềm.","calories":310,"time":35},
  {"id":"ca-ro-phi-019","name":"Cá rô phi đút lò phô mai","region":"quoc-te","difficulty":"trung-binh","ingredients":{"main":["400g phi lê cá rô phi","100g phô mai mozzarella","50g bơ lạt","1 thìa tỏi băm","Nước cốt chanh","Rau mùi tây"],"optional":["Muối biển","Tiêu đen","Kem tươi"]},"steps":["Cá ướp muối, tiêu, nước cốt chanh trong 10 phút.","Trộn bơ mềm, tỏi băm và kem tươi thành sốt bơ tỏi, phết lên khay nướng.","Đặt cá lên khay, rắc phô mai bào đều mặt, nướng lò 180 độ C trong 15 phút.","Lấy ra rắc mùi tây, dùng nóng with salad hoặc bánh mì."],"tags":["baked","cheese","butter","modern","fusion"],"description":"Cá đút lò giữ độ ẩm tự nhiên, lớp phô mai tan chảy béo ngậy mang hương vị phương Tây lạ miệng.","tips":"Bọc kín khay bằng giấy bạc 10 phút đầu để cá chín đều, mở ra 5 phút cuối để phô mai vàng giòn.","calories":290,"time":25},
  {"id":"ca-ro-phi-020","name":"Cá rô phi rang me","region":"mien-nam","difficulty":"de","ingredients":{"main":["500g cá rô phi cắt khúc","50g me chín","2 thìa đường","1 thìa nước mắm","Tỏi băm","Dầu ăn"],"optional":["Mè rang","Ớt sừng","Xà lách"]},"steps":["Cá làm sạch, khứa chéo, chiên ngập dầu đến khi da giòn vàng, vớt ráo.","Me hòa nước ấm, lọc lấy nước cốt chua, đun sôi with đường và nước mắm.","Phi thơm tỏi, đổ sốt me vào cô đặc nhẹ, thả cá vào xóc đều tay.","Bày cá ra đĩa, rắc mè và ớt, ăn kèm xà lách tươi mát."],"tags":["fried","tamarind","sweet-sour","crispy","southern"],"description":"Cá chiên giòn phủ lớp sốt me chua ngọt dẻo sánh, hương vị kích thích vị giác ngay từ miếng đầu tiên.","tips":"Chiên cá lần hai ở lửa lớn giúp da giòn lâu hơn, sốt me cô vừa phải không quá đặc để dễ thấm.","calories":300,"time":35}
]

# Function to determine category and subCategory (same logic)
def get_cats(name, tags):
    name_low = name.lower()
    sub = "khac"
    cat = "com"
    
    if "kho" in name_low or "rim" in name_low or "quẹt" in name_low:
        sub = "kho"
    elif "hấp" in name_low or "hầm" in name_low or "chưng" in name_low:
        sub = "hap"
    elif "canh" in name_low or "riêu" in name_low or "ngót" in name_low:
        sub = "canh"
    elif "chiên" in name_low or "rang" in name_low or "rán" in name_low:
        sub = "chien"
    elif "om" in name_low:
        sub = "kho"
    elif "cháo" in name_low:
        cat = "pho-bun"
        sub = "nuoc"
    elif "nướng" in name_low or "đút lò" in name_low:
        sub = "nuong"
    elif "lẩu" in name_low:
        cat = "pho-bun"
        sub = "nuoc"
    elif "cuốn" in name_low or "gỏi" in name_low:
        cat = "an-vat"
        sub = "tron"
    elif "xào" in name_low:
        sub = "xao"
    elif "sốt" in name_low:
        sub = "sot"
    elif "chả" in name_low:
        sub = "chien"
    elif "bún" in name_low:
        cat = "pho-bun"
        sub = "nuoc"
        
    return cat, sub

# Transform
processed = []
for r in new_recipes_raw:
    cat, sub = get_cats(r["name"], r["tags"])
    
    recipe = {
        "id": r["id"],
        "name": r["name"],
        "category": cat,
        "subCategory": sub,
        "ingredients": r["ingredients"],
        "steps": r["steps"],
        "cookingTime": r["time"],
        "difficulty": r["difficulty"],
        "servings": 4, # Default
        "tags": r["tags"],
        "region": r["region"],
        "calories": r["calories"],
        "tips": r["tips"],
        "description": r["description"]
    }
    processed.append(recipe)

# Merge
with open(FILE_PATH, 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Append new ones
existing.extend(processed)

# Write back
with open(FILE_PATH, 'w', encoding='utf-8') as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)

print(f"Successfully added {len(processed)} recipes.")
