import type { CategoryId, Flashcard, Quiz } from "@/types";

export const seedFlashcards: Flashcard[] = [
  { id: "f1", courseId: "c-etf", front: "什麼是 ETF？", back: "指數股票型基金，追蹤特定指數、可像股票一樣在市場買賣，一次買進即分散投資一籃子標的。" },
  { id: "f2", courseId: "c-etf", front: "費用率代表什麼？", back: "基金每年收取的管理成本占資產的比例。" },
  { id: "f3", courseId: "c-etf", front: "為什麼要分散投資？", back: "降低單一標的波動對整體資產的衝擊。" },
  { id: "f4", courseId: "c-etf", front: "0050 追蹤什麼指數？", back: "台灣 50 指數。" },
  { id: "f5", courseId: "c-pm", front: "需求訪談的第一守則？", back: "問行為與過去發生的事實。" },
  { id: "f6", courseId: "c-pm", front: "什麼是引導性問題？", back: "暗示了期待答案、可能污染訪談資料的問題。" },
  { id: "f7", courseId: "c-ai", front: "用 AI 整理會議記錄的關鍵？", back: "要求輸出決議、待辦、負責人與期限。" },
  { id: "f8", courseId: "c-ai", front: "Prompt 的四個要素？", back: "角色、任務、輸出格式、範例。" },
  { id: "f9", courseId: "c-bake", front: "麵團攪拌過度會怎樣？", back: "麵筋過度形成，成品口感變硬。" },
  { id: "f10", courseId: "c-fin101", front: "三大財報？", back: "損益表、資產負債表、現金流量表。" },
  { id: "f11", courseId: "c-fin101", front: "毛利率反映什麼？", back: "本業的獲利能力。" },
  { id: "f12", courseId: "c-slides", front: "一頁投影片的原則？", back: "一頁一重點，標題直接講結論。" },
  { id: "f13", courseId: "c-language", front: "如何禮貌請對方再說一次？", back: "可以說 Could you say that again, please?" },
  { id: "f14", courseId: "c-language", front: "記住新單字的有效方式？", back: "在不同情境中重複提取並實際造句。" },
  { id: "f15", courseId: "c-fitness", front: "深蹲時膝蓋的方向？", back: "膝蓋方向大致跟腳尖一致，避免明顯內夾。" },
  { id: "f16", courseId: "c-fitness", front: "運動後恢復的三個重點？", back: "睡眠、補充水分與均衡營養。" },
  { id: "f17", courseId: "c-lifestyle", front: "整理空間的第一步？", back: "先依使用頻率分類與減量，再安排固定位置。" },
  { id: "f18", courseId: "c-lifestyle", front: "協調配色的簡單原則？", back: "先選主色與輔色，再加入少量點綴色。" },
  { id: "f19", courseId: "c-arts", front: "欣賞視覺作品可以先觀察什麼？", back: "構圖、色彩、材質，以及作品帶來的感受。" },
  { id: "f20", courseId: "c-arts", front: "策展論述的用途？", back: "提供展覽脈絡，幫助理解作品與主題的關係。" },
];

type QuizSeed = Omit<Quiz, "id" | "courseId" | "category">;

const quiz = (category: CategoryId, index: number, seed: QuizSeed): Quiz => ({
  ...seed,
  id: `quiz-${category}-${index}`,
  courseId: `domain-${category}`,
  category,
});

export const seedQuizzes: Quiz[] = [
  // 投資理財
  quiz("investing", 1, { question: "ETF 最主要的特色是什麼？", options: ["保證每年獲利", "可以一次投資一籃子的資產", "只能由專業投資人購買", "完全不會受到市場波動影響"], answerIndex: 1, explanation: "ETF 通常追蹤特定指數或資產組合，讓投資人一次持有多個標的、達到分散效果；但仍有市場風險，也不保證獲利。" }),
  quiz("investing", 2, { question: "長期投資時，為什麼需要留意 ETF 的費用率？", options: ["費用率越高報酬越好", "長期會持續侵蝕累積報酬", "費用率只收第一年", "費用率不會影響資產"], answerIndex: 1, explanation: "年度費用看似很小，但經過長期複利會明顯影響最終累積成果。" }),
  quiz("investing", 3, { question: "分散投資的主要目的為何？", options: ["保證本金不會虧損", "提高交易次數", "降低單一資產對整體的衝擊", "預測市場高低點"], answerIndex: 2, explanation: "分散投資不能消除所有風險，但可以降低單一標的大幅波動對整體投資組合的影響。" }),
  quiz("investing", 4, { question: "緊急預備金較適合放在哪裡？", options: ["高波動個股", "容易取用且風險較低的工具", "長期鎖定的投資", "單一加密貨幣"], answerIndex: 1, explanation: "緊急預備金重視安全性與流動性，應放在需要時能快速取用的低風險工具。" }),
  quiz("investing", 5, { question: "定期定額投資的常見優點是什麼？", options: ["一定買在最低點", "完全沒有風險", "分散進場時點並建立紀律", "保證高於市場報酬"], answerIndex: 2, explanation: "定期定額有助於分散不同價格的進場時點並培養投資紀律，但不保證獲利。" }),

  // 語言學習
  quiz("language", 1, { question: "下列哪一句最適合用來禮貌詢問對方是否需要幫忙？", options: ["What are you doing?", "Do you need any help?", "You must help me.", "Why are you here?"], answerIndex: 1, explanation: "Do you need any help? 是自然且有禮貌的詢問方式，適合日常或職場情境。" }),
  quiz("language", 2, { question: "初次見面時，哪一句回應最自然？", options: ["Nice to meet you.", "See you yesterday.", "Never mind me.", "Close the meeting."], answerIndex: 0, explanation: "Nice to meet you. 是初次見面時常見的禮貌用語。" }),
  quiz("language", 3, { question: "想請對方再說一次，哪一句較有禮貌？", options: ["Say it now.", "What?", "Could you say that again, please?", "You are wrong."], answerIndex: 2, explanation: "Could you say that again, please? 清楚表達需求，please 也讓語氣更有禮貌。" }),
  quiz("language", 4, { question: "I have lived here ___ three years. 空格應填？", options: ["since", "for", "at", "by"], answerIndex: 1, explanation: "for 接一段時間；since 則接時間起點。" }),
  quiz("language", 5, { question: "哪種方法較能有效記住新單字？", options: ["只看一次中文翻譯", "在不同語境中重複使用", "一次背完後不再複習", "忽略發音"], answerIndex: 1, explanation: "把單字放入不同句子與情境中反覆提取，有助於建立更穩固的記憶。" }),

  // 烘焙料理
  quiz("baking", 1, { question: "製作蛋糕時，麵粉加入濕性材料後，為什麼不宜過度攪拌？", options: ["會讓蛋糕變得太甜", "會讓麵糊顏色變深", "可能使麵筋形成過多，造成口感偏硬", "會讓烤箱溫度下降"], answerIndex: 2, explanation: "過度攪拌可能使麵筋形成過多，導致蛋糕口感較硬；通常攪拌到看不見乾粉即可。" }),
  quiz("baking", 2, { question: "烘焙前預熱烤箱的主要原因是什麼？", options: ["讓廚房變暖", "讓食材更甜", "使烘烤一開始就有穩定溫度", "減少秤重時間"], answerIndex: 2, explanation: "穩定的起始溫度有助於膨發、定型與均勻熟成。" }),
  quiz("baking", 3, { question: "打發蛋白時，器具最好保持什麼狀態？", options: ["沾有油脂", "乾淨且無油無水", "裝滿熱水", "撒上麵粉"], answerIndex: 1, explanation: "油脂或水分可能影響蛋白形成穩定泡沫，因此器具應乾淨且乾燥。" }),
  quiz("baking", 4, { question: "量取麵粉時較準確的方法是？", options: ["用手抓一把", "用電子秤秤重", "用杯子壓緊", "目測即可"], answerIndex: 1, explanation: "重量不受裝填鬆緊影響，使用電子秤通常比容量測量更準確。" }),
  quiz("baking", 5, { question: "蛋糕出爐後立刻切開，可能造成什麼結果？", options: ["更容易定型", "內部組織尚未穩定而塌陷", "甜度增加", "烤箱升溫"], answerIndex: 1, explanation: "剛出爐時內部仍在散熱與定型，適度冷卻後再切能保持較好的組織。" }),

  // 健康健身
  quiz("fitness", 1, { question: "進行深蹲時，下列哪一個做法較正確？", options: ["膝蓋完全向內夾", "背部大幅彎曲", "膝蓋方向大致與腳尖一致", "全程憋氣不呼吸"], answerIndex: 2, explanation: "深蹲時膝蓋方向應大致與腳尖一致，並保持核心穩定與自然呼吸。" }),
  quiz("fitness", 2, { question: "運動前熱身的主要目的為何？", options: ["立即消耗大量脂肪", "逐步提升體溫並準備關節與肌肉", "取代正式訓練", "讓身體完全疲勞"], answerIndex: 1, explanation: "漸進式熱身能讓循環、關節與肌肉進入運動狀態。" }),
  quiz("fitness", 3, { question: "肌力訓練後，身體恢復通常需要什麼？", options: ["完全不喝水", "充足睡眠與營養", "每天只練同一部位", "立刻增加兩倍重量"], answerIndex: 1, explanation: "睡眠、蛋白質與均衡飲食都會影響修復及訓練適應。" }),
  quiz("fitness", 4, { question: "訓練動作出現尖銳疼痛時，較適合怎麼做？", options: ["忍痛繼續", "停止動作並評估狀況", "加快速度", "增加重量"], answerIndex: 1, explanation: "尖銳或異常疼痛可能是警訊，應先停止並視情況尋求專業協助。" }),
  quiz("fitness", 5, { question: "想穩定提升體能，哪種安排通常較合理？", options: ["偶爾一次超量訓練", "循序漸進並規律訓練", "每天完全不休息", "只追求速度忽略姿勢"], answerIndex: 1, explanation: "規律、漸進負荷和適當恢復，比偶發性的極端訓練更可持續。" }),

  // 職場技能
  quiz("career", 1, { question: "在進行需求訪談時，哪一種問題最容易取得有價值的資訊？", options: ["你是不是覺得這個功能很好？", "你會不會每天使用？", "你上一次遇到這個問題是在什麼情境？", "你應該很需要這個功能吧？"], answerIndex: 2, explanation: "詢問過去真實發生的情境，比假設性或引導性問題更能理解實際行為與需求。" }),
  quiz("career", 2, { question: "有效會議開始前，最重要的準備之一是？", options: ["不設定主題", "先提供明確議程與目標", "邀請越多人越好", "取消所有資料"], answerIndex: 1, explanation: "明確議程能讓參與者預先準備，並讓會議聚焦於需要產出的結果。" }),
  quiz("career", 3, { question: "向主管回報進度時，哪種方式較清楚？", options: ["只說還在做", "說明進度、風險與下一步", "隱藏所有問題", "提供無關細節"], answerIndex: 1, explanation: "結構化說明目前狀態、阻礙、需要的協助與下一步，最方便團隊決策。" }),
  quiz("career", 4, { question: "收到模糊任務時，第一步較適合？", options: ["自行猜測到底", "確認目標、範圍與完成標準", "先拖延", "立即交付空白結果"], answerIndex: 1, explanation: "先對齊期待與驗收標準，可以減少重工與溝通落差。" }),
  quiz("career", 5, { question: "提供回饋時，哪種表達較有效？", options: ["批評對方人格", "描述具體行為、影響與建議", "只說不好", "在公開場合嘲諷"], answerIndex: 1, explanation: "聚焦可觀察行為及其影響，再提出可執行建議，較有助於改善。" }),

  // 生活品味
  quiz("lifestyle", 1, { question: "整理居家空間時，較容易持續的方法是？", options: ["一次買更多收納品", "先依使用頻率分類與減量", "把所有物品藏起來", "完全不設定位置"], answerIndex: 1, explanation: "先減量並依使用情境安排固定位置，通常比單純增加收納容器更有效。" }),
  quiz("lifestyle", 2, { question: "打造協調空間配色時，可先從什麼開始？", options: ["同時使用十種主色", "選定主色、輔色與少量點綴色", "每件家具完全不同色", "忽略採光"], answerIndex: 1, explanation: "限制主要色彩數量，再用少量點綴色製造重點，較容易形成一致感。" }),
  quiz("lifestyle", 3, { question: "選購長期使用的生活用品時，較值得優先考量？", options: ["只看短期流行", "使用需求、耐用度與維護成本", "包裝越大越好", "完全不看材質"], answerIndex: 1, explanation: "符合實際需求、耐用且容易維護，通常比追逐短期流行更能提升生活品質。" }),
  quiz("lifestyle", 4, { question: "建立閱讀習慣較可行的做法是？", options: ["第一天讀完十本", "安排固定且低門檻的閱讀時間", "只買書不閱讀", "等待有整天空閒"], answerIndex: 1, explanation: "從每天少量、固定時段開始，比設定過高目標更容易維持。" }),
  quiz("lifestyle", 5, { question: "在小空間中增加舒適感，哪種方式較合適？", options: ["阻擋所有自然光", "保留動線並使用多功能家具", "堆滿大型裝飾", "取消所有照明"], answerIndex: 1, explanation: "清楚動線、適當採光與多功能家具能提升有限空間的使用效率。" }),

  // 行銷
  quiz("digital", 1, { question: "設定行銷目標時，哪一項最符合 SMART 原則？", options: ["讓品牌更好", "三個月內將電子報訂閱提升 20%", "盡量增加曝光", "大家都喜歡產品"], answerIndex: 1, explanation: "具體、可衡量、有期限的目標，才能追蹤成果並調整策略。" }),
  quiz("digital", 2, { question: "內容行銷開始前，應先釐清什麼？", options: ["只選最流行平台", "目標受眾與想解決的問題", "每天發越多越好", "複製競品全部內容"], answerIndex: 1, explanation: "理解受眾、需求和使用情境，才能設計真正有價值的內容。" }),
  quiz("digital", 3, { question: "轉換率通常用來衡量什麼？", options: ["顏色數量", "完成目標行動的使用者比例", "員工人數", "文章字數"], answerIndex: 1, explanation: "轉換率代表訪客中完成購買、註冊等目標行動的比例。" }),
  quiz("digital", 4, { question: "進行 A/B 測試時，較正確的做法是？", options: ["同時改十個元素", "每次聚焦測試一個主要變因", "只觀察一天就下結論", "兩組使用完全不同受眾"], answerIndex: 1, explanation: "控制其他條件並聚焦主要變因，才較能判斷差異來自哪個改動。" }),
  quiz("digital", 5, { question: "品牌定位最主要是在回答什麼？", options: ["辦公室在哪裡", "希望在目標受眾心中占據什麼位置", "產品有幾個按鈕", "每天開幾次會"], answerIndex: 1, explanation: "品牌定位定義目標受眾、差異化價值，以及希望建立的心智印象。" }),

  // 藝文娛樂
  quiz("beauty", 1, { question: "欣賞一件視覺藝術作品時，可先從哪裡開始觀察？", options: ["只看價格", "構圖、色彩、材質與感受", "只問是否有名", "跳過作品本身"], answerIndex: 1, explanation: "從作品可見的形式元素與自身感受開始，再延伸理解背景，能建立更完整的觀看經驗。" }),
  quiz("beauty", 2, { question: "電影中的配樂通常能發揮什麼作用？", options: ["只增加片長", "營造情緒並強化敘事節奏", "取代所有台詞", "讓畫面變亮"], answerIndex: 1, explanation: "配樂能提示情緒、建立氣氛，並協助觀眾感受劇情節奏。" }),
  quiz("beauty", 3, { question: "參觀展覽前先閱讀策展論述，有什麼幫助？", options: ["保證喜歡每件作品", "理解展覽主題與作品之間的關係", "不用再看作品", "只記住票價"], answerIndex: 1, explanation: "策展論述提供觀看脈絡，有助於理解作品如何共同回應主題。" }),
  quiz("beauty", 4, { question: "戲劇中的『角色動機』指的是？", options: ["演員的服裝尺寸", "推動角色做出行動的需求與原因", "舞台的高度", "觀眾人數"], answerIndex: 1, explanation: "角色動機解釋角色為何採取行動，是理解情節與人物弧線的重要線索。" }),
  quiz("beauty", 5, { question: "培養藝文欣賞能力，哪種方式較有效？", options: ["只接受一種標準答案", "接觸不同作品並記錄觀察與感受", "只看熱門排行榜", "避免討論"], answerIndex: 1, explanation: "多元接觸、主動觀察與交流能逐步建立自己的欣賞觀點。" }),
];
