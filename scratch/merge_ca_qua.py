import json
import os

FILE_PATH = r'c:\Users\Hai\.gemini\antigravity\scratch\nau-gi-day-pwa\src\lib\recipes_data.json'

new_recipes_raw = [
  {"id":"ca-qua-001","name":"Cá quả kho tộ","region":"toan-quoc","difficulty":"de","ingredients":{"main":["1 con cá quả khoảng 700g","1 thìa canh nước mắm ngon","1 thìa canh đường","1 thìa nhỏ hạt tiêu","1 củ hành khô","1 quả ớt hiểm"],"optional":["Mỡ nước","Hành lá","Dưa leo ăn kèm"]},"steps":["Sơ sạch cá quả, cắt khúc vừa ăn, ướp với nước mắm, đường, tiêu, hành tím băm trong 15 phút.","Đun nóng tộ đất, tráng ít mỡ nước rồi xếp cá vào, đổ thêm nước ướp.","Kho lửa nhỏ liu riu khoảng 20 phút đến khi nước sốt keo lại.","Thêm ớt hiểm, hành lá rồi tắt bếp, dùng nóng với cơm trắng."],"tags":["braised","savory","traditional","comfort-food","home-cooking"],"description":"Món cá kho đậm đà, thịt chắc ngọt thấm đẫm gia vị trong chiếc tộ đất giữ nhiệt tuyệt vời.","tips":"Nên kho bằng tộ đất và dùng mỡ nước thay dầu ăn để món ăn béo ngậy và thơm hơn.","calories":280,"time":40},
  {"id":"ca-qua-002","name":"Cá quả nướng riềng mẻ","region":"mien-bac","difficulty":"trung-binh","ingredients":{"main":["1 con cá quả 800g","3 củ riềng nhỏ","2 thìa mẻ lọc","1 thìa mắm tôm","1 thìa đường","1 thìa nghệ băm"],"optional":["Mẻ lọc thêm","Bánh tráng","Rau sống, bún"]},"steps":["Làm sạch cá, khứa đều hai mặt để gia vị ngấm sâu.","Giã nhuyễn riềng, mẻ, mắm tôm, nghệ, đường thành hỗn hợp sệt, ướp cá ít nhất 30 phút.","Nướng cá trên than hoa hoặc vỉ nướng điện, lật đều tay đến khi vàng giòn hai mặt.","Dọn kèm bún tươi, bánh tráng nướng giòn và rau sống cuốn chấm mẻ pha."],"tags":["grilled","aromatic","northern","street-food","fermented"],"description":"Vị chua mẻ quyện riềng thơm nồng thấm vào từng thớ cá nướng than hoa thơm lừng.","tips":"Cá nướng cần lửa vừa, tránh lật nhiều làm nát cá, phết thêm chút mỡ hành khi nướng để da giòn.","calories":220,"time":50},
  {"id":"ca-qua-003","name":"Canh chua cá quả","region":"mien-nam","difficulty":"de","ingredients":{"main":["500g cá quả phi lê hoặc cắt khoanh","1 quả cà chua","50g me tươi","100g bạc hà","50g đậu bắp","10g giá đỗ","2 trái ớt","2 thìa canh đường","1 thìa canh nước mắm"],"optional":["Ngò gai","Hành phi","Rau nhút"]},"steps":["Sơ chế cá sạch, ướp nhẹ với chút muối và tiêu.","Nấu me với nước sôi dằm nát lọc lấy nước cốt chua.","Đun sôi nước dùng, cho cá vào nấu chín nhẹ nhàng vớt ra để riêng.","Thả cà chua, bạc hà, đậu bắp vào nồi, nêm đường, nước mắm cho vừa miệng.","Cho cá và giá đỗ vào lại, tắt bếp, rắc ngò gai, ớt và hành phi."],"tags":["sour-soup","refreshing","southern","healthy","quick-meal"],"description":"Canh chua thanh mát với vị chua tự nhiên từ me, cá ngọt mềm hòa quyện rau củ giòn tươi.","tips":"Không nấu cá quá lâu để tránh nát, cho cá vào lại nồi ở bước cuối để thịt săn chắc.","calories":180,"time":30},
  {"id":"ca-qua-004","name":"Chả cá Lã Vọng","region":"mien-bac","difficulty":"trung-binh","ingredients":{"main":["500g phi lê cá quả","2 thìa nước mắm","1 thìa nghệ tươi giã nhuyễn","1 thìa mẻ","1 bó thì là","1 củ hành lá","100g bún tươi"],"optional":["Hành khô phi thơm","Lạc rang","Tôm chua"]},"steps":["Phi lê cá thái miếng dày, ướp nước mắm, nghệ, mẻ trong 2 tiếng.","Xếp cá vào chảo gang, rắc thì là và hành lá cắt khúc lên trên.","Đun nóng dầu ăn, áp chảo cá chín vàng hai mặt, đảo nhẹ để thì là vừa chín tới.","Dọn ra bàn ăn kèm bún, hành phi, lạc rang và chấm mắm nêm hoặc mắm tôm."],"tags":["pan-fried","classic","hanoi","herbal","umami"],"description":"Chả cá nghệ vàng óng, thơm nồng mùi thì là và hành lá, ăn kèm bún tươi và mắm tôm đặc trưng.","tips":"Nên dùng chảo gang dày để giữ nhiệt, cho cá vào chảo nóng già để bề mặt cá se lại nhanh, không bị nát.","calories":260,"time":45},
  {"id":"ca-qua-005","name":"Cá quả hấp bia","region":"toan-quoc","difficulty":"de","ingredients":{"main":["1 con cá quả 600g","1 lon bia","2 nhánh sả đập dập","1 củ gừng thái sợi","1 thìa nước mắm","Hành lá, thì là"],"optional":["Ớt hiểm","Dấm gạo","Nước tương"]},"steps":["Rửa sạch cá, khứa vài đường trên thân cá.","Xếp sả, gừng lót dưới đĩa hấp, đặt cá lên trên, rưới bia và nước mắm đều khắp thân cá.","Hấp cách thủy lửa lớn khoảng 15-20 phút đến khi cá chín mềm.","Lấy ra rắc hành lá, thì là, gừng sợi, ăn nóng kèm nước mắm gừng pha loãng."],"tags":["steamed","light","aromatic","low-fat","easy"],"description":"Cá hấp bia giữ nguyên độ ngọt tự nhiên, thấm đẫm hương sả gừng thanh nhẹ, tốt cho sức khỏe.","tips":"Dùng bia không đường hoặc bia tươi sẽ giúp cá thơm hơn, không nên hấp quá lâu làm khô thịt cá.","calories":190,"time":30},
  {"id":"ca-qua-006","name":"Cá quả rán sốt cà chua","region":"toan-quoc","difficulty":"de","ingredients":{"main":["400g cá quả cắt khúc","3 quả cà chua chín","2 thìa nước mắm","1 thìa đường","1 thìa cà phê bột ngọt","Hành khô, tỏi","Dầu ăn"],"optional":["Hành lá","Rau mùi","Ớt tươi"]},"steps":["Cá rửa sạch, ướp chút muối và tiêu trong 10 phút.","Chiên cá vàng giòn hai mặt, vớt ra để ráo dầu.","Phi thơm hành tỏi, xào cà chua chín nhừ, nêm nước mắm, đường, mì chính.","Cho cá vào rim nhẹ 5 phút cho thấm sốt, rắc hành lá và ớt rồi tắt bếp."],"tags":["fried","tomato-sauce","family-meal","tangy","crispy"],"description":"Cá giòn rụm hòa quyện sốt cà chua chua ngọt đậm đà, đưa cơm cực kỳ hiệu quả.","tips":"Nên chọn cà chua chín đỏ để sốt lên màu đẹp và vị chua ngọt tự nhiên, rim nhỏ lửa để cá không bị nát.","calories":240,"time":35},
  {"id":"ca-qua-007","name":"Lẩu cá quả măng chua","region":"mien-bac","difficulty":"trung-binh","ingredients":{"main":["1kg cá quả cắt lát dày","200g măng chua ngâm","1 quả cà chua","1 thìa mẻ lọc","2 thìa nước mắm","500ml nước dùng","Nấm hương, nấm rơm"],"optional":["Bún tươi","Rau muống, cải cúc","Hành khô phi thơm"]},"steps":["Sơ chế măng chua luộc sơ 2 nước, rửa sạch, thái miếng vừa ăn.","Phi hành khô, xào măng và cà chua, đổ nước dùng vào đun sôi.","Nêm nước mắm, mẻ, đường cho vừa vị, thả nấm vào.","Khi nước lẩu sôi, nhúng từng lát cá chín tái, ăn kèm bún và rau sống."],"tags":["hotpot","fermented-bamboo","sour","communal","warming"],"description":"Nước lẩu chua thanh từ măng lên men, cá ngọt mềm tan ngay trong miệng, thích hợp cho bữa ăn gia đình sum họp.","tips":"Măng cần luộc kỹ để loại bỏ độc tố và vị hăng, nước lẩu nên nêm hơi đậm vì nhúng cá và rau sẽ làm loãng vị.","calories":210,"time":45},
  {"id":"ca-qua-008","name":"Cá quả om dưa","region":"mien-bac","difficulty":"de","ingredients":{"main":["500g cá quả cắt khúc","200g dưa cải muối chua","2 quả cà chua","1 thìa mẻ","1 thìa nước mắm","Hành khô, tỏi"],"optional":["Thì là","Hành lá","Ớt"]},"steps":["Dưa cải rửa sạch, vắt ráo, xào thơm với hành tỏi.","Cho cà chua thái múi cau vào xào cùng, thêm nước và mẻ đun sôi.","Xếp cá vào nồi, om lửa nhỏ 15 phút cho cá thấm vị chua ngọt.","Rắc thì là, hành lá, ớt rồi bắc ra, dùng nóng với cơm."],"tags":["braised","pickled-vegetable","traditional","sour-savory","rustic"],"description":"Vị chua dịu của dưa cải muối hòa quyện thịt cá ngọt mềm, món ăn dân dã nhưng vô cùng cuốn hút.","tips":"Chọn dưa cải muối vừa chua, không quá mặn, om cá lửa nhỏ để thịt không bị bở.","calories":200,"time":35},
  {"id":"ca-qua-009","name":"Cá quả kho tiêu","region":"toan-quoc","difficulty":"de","ingredients":{"main":["600g cá quả cắt khoanh","2 thìa nước cốt dừa","2 thìa nước mắm","1 thìa đường","2 thìa tiêu đen xay","1 củ hành tím"],"optional":["Ớt sừng","Mỡ heo","Dưa món"]},"steps":["Cá ướp nước mắm, đường, hành tím băm, tiêu trong 20 phút.","Đun nóng nồi, thắng ít đường làm màu caramen rồi xếp cá vào.","Rưới nước cốt dừa, kho lửa nhỏ đến khi nước sánh đặc.","Rắc thêm tiêu và ớt, tắt bếp, dùng kèm cơm trắng và dưa món."],"tags":["braised","peppery","coconut-milk","rich","classic"],"description":"Món kho đậm vị với tiêu đen thơm nồng, nước sốt dừa béo ngậy quyện chặt từng miếng cá.","tips":"Thêm 1 thìa mỡ heo hoặc nước cốt dừa cuối cùng sẽ giúp món ăn bóng đẹp và béo thơm hơn.","calories":290,"time":40},
  {"id":"ca-qua-010","name":"Cháo cá quả","region":"toan-quoc","difficulty":"de","ingredients":{"main":["300g gạo tẻ","400g cá quả","50g gừng thái sợi","1 lít nước hầm xương","Hành khô phi thơm","Rau thì là"],"optional":["Hành lá","Tiêu xay","Quẩy"]},"steps":["Vo gạo, nấu cháo nhừ với nước hầm xương.","Cá luộc chín, gỡ lấy thịt, xương cá để lọc nước dùng trong.","Phi hành khô, xào thịt cá săn lại, cho vào nồi cháo đun sôi nhẹ.","Nêm gia vị vừa ăn, rắc gừng, thì là, hành lá và tiêu, múc ra tô dùng với quẩy."],"tags":["porridge","nutritious","comforting","easy-digest","breakfast"],"description":"Cháo trắng dẻo mịn quyện thịt cá ngọt lành, ấm bụng và dễ tiêu hóa cho mọi lứa tuổi.","tips":"Nên xào thịt cá với hành phi trước khi cho vào cháo để khử mùi tanh và tăng độ thơm.","calories":320,"time":50},
  {"id":"ca-qua-011","name":"Cá quả chiên giòn sốt me","region":"mien-nam","difficulty":"trung-binh","ingredients":{"main":["1 con cá quả 700g","50g me chín","2 thìa đường","1 thìa nước mắm","1 thìa tương ớt","Tỏi băm","Dầu ăn"],"optional":["Mè rang","Ớt sừng","Xà lách"]},"steps":["Cá làm sạch, khứa chéo, chiên ngập dầu đến khi da giòn vàng, vớt ráo.","Me hòa nước ấm, lọc lấy nước cốt chua, đun sôi với đường, nước mắm, tương ớt.","Phi thơm tỏi, đổ sốt me vào cô đặc nhẹ, nhúng cá chiên vào đảo nhanh tay.","Bày cá ra đĩa, rưới sốt me còn lại, rắc mè và ớt, ăn kèm xà lách."],"tags":["deep-fried","sweet-sour","tamarind-sauce","crispy","southern"],"description":"Cá chiên vàng giòn rụm phủ lớp sốt me chua ngọt dẻo sánh, kích thích vị giác ngay từ miếng đầu tiên.","tips":"Chiên cá lần đầu ở lửa vừa cho chín, lần hai lửa lớn để da giòn, sốt me cần cô vừa phải không quá đặc.","calories":310,"time":40},
  {"id":"ca-qua-012","name":"Bún cá quả","region":"mien-nam","difficulty":"trung-binh","ingredients":{"main":["500g cá quả phi lê","500g bún tươi","1 lít nước dùng xương heo","1 quả cà chua","2 thìa mắm nêm","Rau sống các loại"],"optional":["Hành phi","Ớt băm","Mắm ruốc","Hành tây"]},"steps":["Xương heo hầm lấy nước dùng trong, nêm muối nhẹ.","Phi lê cá ướp gia vị, chiên hoặc hấp chín, để nguyên miếng hoặc xé nhỏ.","Phi hành tây, xào cà chua, đổ vào nồi nước dùng, nêm mắm nêm cho dậy mùi.","Trụng bún, xếp cá vào tô, chan nước dùng, thêm rau sống và hành phi."],"tags":["noodle-soup","savory","umami","street-food","filling"],"description":"Nước dùng ngọt thanh từ xương và mắm nêm đặc trưng, cá dai ngọt hòa quyện sợi bún mềm mại.","tips":"Nước dùng bún cá cần trong và ngọt tự nhiên, mắm nêm pha loãng vừa phải để không lấn át vị cá.","calories":380,"time":60},
  {"id":"ca-qua-013","name":"Cá quả hấp gừng","region":"toan-quoc","difficulty":"de","ingredients":{"main":["1 con cá quả 600g","50g gừng tươi","2 thìa rượu trắng","1 thìa nước tương","Hành lá","Dầu mè"],"optional":["Ớt chỉ thiên","Xì dầu","Giấm"]},"steps":["Cá rửa sạch, ướp rượu trắng và gừng đập dập trong 10 phút khử tanh.","Xếp cá vào đĩa, rải gừng thái sợi mỏng lên trên.","Hấp cách thủy 15 phút đến khi thịt cá trắng đục, chín mềm.","Rưới nước tương, dầu mè, rắc hành lá thái nhỏ, dùng nóng."],"tags":["steamed","ginger","light","healthy","detox"],"description":"Hương gừng ấm áp khử hoàn toàn vị tanh, giữ trọn độ tươi ngọt và mềm mại của thịt cá.","tips":"Rượu trắng và gừng tươi là bộ đôi hoàn hảo để ướp cá hấp, giúp thịt săn và thơm hơn hẳn.","calories":170,"time":25},
  {"id":"ca-qua-014","name":"Cá quả nấu giấm","region":"mien-bac","difficulty":"de","ingredients":{"main":["500g cá quả cắt khúc","50ml giấm gạo","1 củ hành khô","1 thìa đường","1 thìa nước mắm","Dưa chuột, cà chua"],"optional":["Thì là","Hành lá","Ớt"]},"steps":["Cá ướp chút muối và giấm gạo trong 15 phút.","Phi hành khô thơm, xào cà chua, đổ nước đun sôi, nêm đường, nước mắm.","Thả cá vào nấu nhỏ lửa 10 phút, cho dưa chuột thái lát vào nấu chín tới.","Rắc thì là, hành lá, ớt, tắt bếp, ăn ngay khi còn nóng."],"tags":["vinegar-stew","sour","refreshing","summer-dish","simple"],"description":"Vị giấm thanh chua nhẹ làm nền cho thịt cá ngọt mềm, món ăn giải nhiệt tuyệt vời cho ngày hè.","tips":"Không cho giấm vào quá sớm để tránh làm thịt cá bị khô, nêm giấm cuối cùng để giữ độ chua tươi.","calories":190,"time":30},
  {"id":"ca-qua-015","name":"Gỏi cá quả","region":"mien-trung","difficulty":"kho","ingredients":{"main":["300g phi lê cá quả tươi sống","50g thính gạo rang","50g dừa nạo sợi","30g mè rang","Rau thơm các loại","Chanh, ớt, tỏi"],"optional":["Bánh tráng nướng","Dưa leo","Xoài xanh"]},"steps":["Phi lê cá thái lát mỏng, trộn nhanh với nước chanh và ớt để tái chanh cá.","Thêm dừa nạo, mè, thính rang, rau thơm thái nhỏ vào trộn đều.","Nêm đường, nước mắm, chanh cho vị chua ngọt hài hòa.","Ăn kèm bánh tráng nướng giòn và rau sống, chấm nước mắm pha đặc."],"tags":["salad","raw","citrus","crunchy","central"],"description":"Món gỏi tươi mát với thịt cá tái chanh dai ngọt, hòa quyện vị béo dừa và giòn thính đặc trưng.","tips":"Cá phải thật tươi, dao thật sắc để thái lát mỏng, trộn đều tay và ăn ngay để đảm bảo độ giòn tươi.","calories":210,"time":35},
  {"id":"ca-qua-016","name":"Cá quả kho dứa","region":"toan-quoc","difficulty":"de","ingredients":{"main":["500g cá quả cắt khoanh","1/2 quả dứa chín","2 thìa nước mắm","1 thìa đường","1 thìa tiêu","Hành khô, tỏi"],"optional":["Ớt","Mỡ nước","Hành lá"]},"steps":["Cá ướp nước mắm, đường, tiêu trong 15 phút.","Dứa gọt sạch, cắt miếng vừa, xào thơm với hành tỏi.","Xếp cá lên trên dứa, rưới thêm ít nước, kho lửa nhỏ 20 phút.","Nước sánh lại, cá thấm vị chua ngọt dứa, rắc tiêu và hành lá rồi tắt bếp."],"tags":["braised","pineapple","sweet-tangy","tropical","family-style"],"description":"Dứa chua ngọt tự nhiên làm mềm thịt cá, tạo nên hương vị nhiệt đới đặc trưng khó cưỡng.","tips":"Chọn dứa vừa chín tới, không quá chua để nước kho có độ sánh ngọt vừa phải, kho bằng nồi đất giữ nhiệt tốt hơn.","calories":250,"time":40},
  {"id":"ca-qua-017","name":"Cá quả xào lăn","region":"mien-nam","difficulty":"trung-binh","ingredients":{"main":["400g phi lê cá quả","1 hộp nước cốt dừa","2 thìa bột cà ri","1 củ sả đập dập","Hành khô, tỏi","Rau ngổ"],"optional":["Ớt sừng","Bánh mì","Cà chua"]},"steps":["Phi lê cá cắt miếng vuông, ướp bột cà ri, sả băm, hành tỏi 20 phút.","Phi thơm sả cây, xào cá săn lại, đổ nước cốt dừa vào đun nhỏ lửa.","Nêm muối, đường cho vừa miệng, đun đến khi nước sánh đặc lại.","Rắc rau ngổ, ớt sừng, tắt bếp, ăn kèm bánh mì hoặc cơm."],"tags":["stir-fried","curry","coconut","aromatic","southern"],"description":"Nước cốt dừa béo ngậy quyện hương cà ri và sả, cá mềm ngọt thấm đẫm gia vị đậm chất Nam Bộ.","tips":"Đảo cá nhẹ tay để không nát, nước cốt dừa nên cho vào sau khi cá se mặt để giữ độ trắng mềm.","calories":330,"time":35},
  {"id":"ca-qua-018","name":"Canh cá quả nấu rau thì là","region":"mien-bac","difficulty":"de","ingredients":{"main":["300g cá quả phi lê","1 bó rau thì là","500ml nước dùng","2 thìa nước mắm","1 củ hành khô","Tiêu xay"],"optional":["Hành lá","Ớt","Gừng"]},"steps":["Phi lê cá thái miếng, ướp chút nước mắm và tiêu.","Phi hành khô thơm, đổ nước dùng đun sôi, thả cá vào nấu chín.","Nêm nước mắm, đường cho vừa miệng, cho rau thì là thái nhỏ vào đảo nhanh.","Tắt bếp ngay, múc ra tô rắc hành lá và ớt, dùng nóng."],"tags":["soup","dill","light","quick","traditional"],"description":"Hương thì là đặc trưng quyện với nước dùng trong vắt và thịt cá ngọt lành, thanh mát dễ chịu.","tips":"Thì là cho vào cuối cùng, đảo nhẹ và tắt bếp ngay để giữ màu xanh và hương thơm đặc trưng.","calories":160,"time":20},
  {"id":"ca-qua-019","name":"Cá quả đút lò nấm","region":"quoc-te","difficulty":"trung-binh","ingredients":{"main":["400g phi lê cá quả","100g nấm mỡ","50g bơ lạt","1 thìa tỏi băm","Nước cốt chanh","Rau mùi tây"],"optional":["Phô mai bào","Muối biển","Tiêu đen"]},"steps":["Cá ướp muối, tiêu, nước cốt chanh trong 10 phút.","Xào nấm với bơ và tỏi cho thơm, xếp vào khay nướng.","Đặt cá lên trên nấm, phết lớp bơ mỏng, nướng lò 180 độ C trong 15 phút.","Lấy ra rắc mùi tây và phô mai bào, dùng nóng."],"tags":["baked","mushroom","butter","modern","elegant"],"description":"Cá đút lò giữ độ ẩm tự nhiên, kết hợp nấm bơ béo ngậy mang hương vị hiện đại nhưng vẫn quen thuộc.","tips":"Bọc kín khay bằng giấy bạc trong 10 phút đầu để cá chín đều, mở ra 5 phút cuối để bề mặt vàng thơm.","calories":270,"time":30},
  {"id":"ca-qua-020","name":"Cá quả rang muối","region":"mien-nam","difficulty":"de","ingredients":{"main":["500g cá quả cắt khoanh","3 thìa muối hạt","1 thìa tiêu","1 củ hành khô","Ớt sừng","Dầu ăn"],"optional":["Lá chanh","Hành tím phi","Tương ớt"]},"steps":["Cá rửa sạch, để ráo, ướp chút tiêu trong 5 phút.","Đun nóng dầu, chiên sơ cá vàng nhẹ, vớt ra.","Phi hành khô, cho muối hạt vào rang nóng, thả cá vào xóc đều tay.","Rang đến khi muối bám đều, cá giòn thơm, rắc ớt sừng và lá chanh rồi tắt bếp."],"tags":["salt-roasted","crispy","salty","appetizer","southern"],"description":"Lớp muối rang nóng làm se mặt cá, tạo độ giòn bên ngoài và giữ ngọt mềm bên trong cực kỳ bắt vị.","tips":"Rang muối trên lửa nhỏ để muối không cháy, xóc cá đều tay để muối bám mỏng, không nên ướp mặn trước.","calories":260,"time":30}
]

# Function to determine category and subCategory (same as before)
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
