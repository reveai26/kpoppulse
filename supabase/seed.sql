-- KpopPulse Seed Data: Top K-pop Groups & Idols (by popularity)
-- Popularity score: estimated based on global fandom size, social media, streaming

-- ============================================================
-- News Sources
-- ============================================================
INSERT INTO public.sources (name, url, rss_url, category) VALUES
('Naver Entertainment', 'https://entertain.naver.com', 'https://entertain.naver.com/rss/news.xml', 'portal'),
('Dispatch', 'https://www.dispatch.co.kr', NULL, 'exclusive'),
('Sports Chosun', 'https://sports.chosun.com', 'https://sports.chosun.com/rss/entertainment.xml', 'newspaper'),
('OSEN', 'https://www.osen.co.kr', NULL, 'agency'),
('Star News', 'https://star.mt.co.kr', NULL, 'agency'),
('Newsen', 'https://www.newsen.com', NULL, 'agency'),
('Herald Pop', 'https://heraldpop.chosun.com', NULL, 'newspaper'),
('Xportsnews', 'https://www.xportsnews.com', NULL, 'agency'),
('MK Sports', 'https://mksports.co.kr', NULL, 'newspaper'),
('SPOTV News', 'https://www.spotvnews.co.kr', NULL, 'media'),
('Top Star News', 'https://www.topstarnews.net', NULL, 'web'),
('Tenasia', 'https://tenasia.hankyung.com', NULL, 'web'),
('Idol Issue', 'https://www.idolissue.com', NULL, 'web'),
('Daily Pop', 'https://dailypop.kr', NULL, 'web'),
('K-pop Herald', 'https://kpopherald.koreaherald.com', NULL, 'newspaper');

-- ============================================================
-- Groups (Top 40+ by global popularity)
-- ============================================================
INSERT INTO public.groups (name, name_ko, slug, agency, debut_date, member_count, popularity_score, description) VALUES
-- Tier 1: Global Mega (10000+)
('BTS', '방탄소년단', 'bts', 'BIGHIT MUSIC (HYBE)', '2013-06-13', 7, 15000, 'Global K-pop phenomenon, 7-member group known for genre-blending music and powerful performances.'),
('BLACKPINK', '블랙핑크', 'blackpink', 'YG Entertainment', '2016-08-08', 4, 14000, '4-member girl group, one of the biggest K-pop acts globally with record-breaking music videos.'),
('Stray Kids', '스트레이 키즈', 'stray-kids', 'JYP Entertainment', '2018-03-25', 8, 12000, 'Self-producing 8-member group known for experimental sound and powerful performances.'),
('SEVENTEEN', '세븐틴', 'seventeen', 'PLEDIS (HYBE)', '2015-05-26', 13, 11500, '13-member self-producing group with vocal, hip-hop, and performance units.'),
('aespa', '에스파', 'aespa', 'SM Entertainment', '2020-11-17', 4, 11000, '4-member girl group pioneering the metaverse concept in K-pop.'),
('NewJeans', '뉴진스', 'newjeans', 'ADOR (HYBE)', '2022-07-22', 5, 10500, '5-member girl group known for Y2K aesthetics and fresh, catchy music.'),

-- Tier 2: Top Global (8000-10000)
('ENHYPEN', '엔하이픈', 'enhypen', 'BELIFT LAB (HYBE)', '2020-11-30', 7, 9500, '7-member group formed through I-LAND, known for dark fantasy concepts.'),
('TXT', '투모로우바이투게더', 'txt', 'BIGHIT MUSIC (HYBE)', '2019-03-04', 5, 9000, '5-member group known for storytelling and genre-crossing music.'),
('TWICE', '트와이스', 'twice', 'JYP Entertainment', '2015-10-20', 9, 8800, '9-member girl group, one of the best-selling K-pop girl groups.'),
('IVE', '아이브', 'ive', 'Starship Entertainment', '2021-12-01', 6, 8500, '6-member girl group known for confident, empowering music.'),
('LE SSERAFIM', '르세라핌', 'le-sserafim', 'SOURCE MUSIC (HYBE)', '2022-05-02', 5, 8200, '5-member girl group known for fierce concepts and choreography.'),
('(G)I-DLE', '(여자)아이들', 'g-i-dle', 'CUBE Entertainment', '2018-05-02', 5, 8000, 'Self-producing 5-member girl group known for bold concepts.'),

-- Tier 3: Major (6000-8000)
('NCT 127', 'NCT 127', 'nct-127', 'SM Entertainment', '2016-07-07', 10, 7800, 'Seoul-based unit of NCT, known for experimental and energetic music.'),
('NCT DREAM', 'NCT DREAM', 'nct-dream', 'SM Entertainment', '2016-08-24', 7, 7500, 'Youth unit of NCT, known for fresh and energetic concepts.'),
('ATEEZ', '에이티즈', 'ateez', 'KQ Entertainment', '2018-10-24', 8, 7200, '8-member group known for theatrical performances and pirate concepts.'),
('EXO', '엑소', 'exo', 'SM Entertainment', '2012-04-08', 9, 7000, 'Legendary group with massive global fandom, known for powerful vocals.'),
('Red Velvet', '레드벨벳', 'red-velvet', 'SM Entertainment', '2014-08-01', 5, 6800, '5-member group known for dual red (pop) and velvet (R&B) concepts.'),
('ITZY', '있지', 'itzy', 'JYP Entertainment', '2019-02-12', 5, 6500, '5-member girl group known for self-confidence messaging.'),
('NMIXX', 'NMIXX', 'nmixx', 'JYP Entertainment', '2022-02-22', 6, 6300, '6-member girl group known for genre-mixing MIXX POP.'),
('Dreamcatcher', '드림캐쳐', 'dreamcatcher', 'Dreamcatcher Company', '2017-01-13', 7, 6200, '7-member group known for rock-influenced K-pop and dark concepts.'),
('TREASURE', '트레저', 'treasure', 'YG Entertainment', '2020-08-07', 10, 6000, '10-member group known for youthful energy and powerful performances.'),

-- Tier 4: Rising/Established (4000-6000)
('MONSTA X', '몬스타엑스', 'monsta-x', 'Starship Entertainment', '2015-05-14', 6, 5800, 'Known for powerful performances and strong international presence.'),
('SHINee', '샤이니', 'shinee', 'SM Entertainment', '2008-05-25', 4, 5500, 'Legendary group known as Princes of K-pop, pioneers of contemporary K-pop.'),
('MAMAMOO', '마마무', 'mamamoo', 'RBW Entertainment', '2014-06-18', 4, 5300, '4-member vocal powerhouse known for live performances.'),
('Kep1er', '케플러', 'kep1er', 'WAKEONE (Swing)', '2022-01-03', 9, 5000, 'Project group formed through Girls Planet 999.'),
('BOYNEXTDOOR', '보이넥스트도어', 'boynextdoor', 'KOZ (HYBE)', '2023-05-30', 6, 4800, '6-member group known for relatable, everyday concepts.'),
('TWS', 'TWS', 'tws', 'PLEDIS (HYBE)', '2024-01-22', 6, 4600, '6-member rookie group, fresh and youthful.'),
('ILLIT', 'ILLIT', 'illit', 'BELIFT LAB (HYBE)', '2024-03-25', 5, 4500, '5-member rookie girl group from I-LAND 2.'),
('BABYMONSTER', '베이비몬스터', 'babymonster', 'YG Entertainment', '2023-11-27', 7, 4400, '7-member girl group, YG next generation.'),
('RIIZE', 'RIIZE', 'riize', 'SM Entertainment', '2023-09-04', 6, 4300, '6-member boy group, SM new generation.'),
('ZB1', '제로베이스원', 'zb1', 'WAKEONE', '2023-07-09', 9, 4200, '9-member project group from Boys Planet.'),
('xikers', 'xikers', 'xikers', 'KQ Entertainment', '2023-03-30', 10, 4000, '10-member group, juniors of ATEEZ.'),

-- Tier 5: Notable (3000-4000)
('GOT7', 'GOT7', 'got7', 'Independent (prev. JYP)', '2014-01-16', 7, 3800, 'Self-owned group known for versatile music and acrobatics.'),
('WINNER', '위너', 'winner', 'YG Entertainment', '2014-08-17', 4, 3500, '4-member group known for self-produced music.'),
('iKON', '아이콘', 'ikon', 'YG Entertainment / 143)', '2015-09-15', 6, 3300, 'Known for Love Scenario and energetic performances.'),
('VIVIZ', '비비지', 'viviz', 'BIG PLANET MADE', '2022-02-09', 3, 3200, '3-member group, former GFriend members.'),
('fromis_9', '프로미스나인', 'fromis-9', 'PLEDIS (HYBE)', '2018-01-24', 9, 3100, '9-member girl group known for bright concepts.'),
('Billlie', 'Billlie', 'billlie', 'MYSTIC STORY', '2021-11-10', 6, 3000, '6-member group known for unique mystic pop.'),
('KISS OF LIFE', 'KISS OF LIFE', 'kiss-of-life', 'S2 Entertainment', '2023-07-05', 4, 3000, '4-member girl group known for retro-inspired music.');

-- ============================================================
-- Idols (Members of Top Groups - by popularity within group)
-- ============================================================

-- BTS members
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Jungkook', '전정국', 'jungkook', (SELECT id FROM public.groups WHERE slug='bts'), 'Main Vocal, Lead Dancer, Sub Rapper', '1997-09-01', 'Korean', 15000),
('V', '뷔', 'v-bts', (SELECT id FROM public.groups WHERE slug='bts'), 'Visual, Vocal', '1995-12-30', 'Korean', 14500),
('Jimin', '지민', 'jimin', (SELECT id FROM public.groups WHERE slug='bts'), 'Main Dancer, Lead Vocal', '1995-10-13', 'Korean', 14000),
('SUGA', '슈가', 'suga', (SELECT id FROM public.groups WHERE slug='bts'), 'Lead Rapper', '1993-03-09', 'Korean', 13000),
('RM', 'RM', 'rm', (SELECT id FROM public.groups WHERE slug='bts'), 'Leader, Main Rapper', '1994-09-12', 'Korean', 12500),
('Jin', '진', 'jin', (SELECT id FROM public.groups WHERE slug='bts'), 'Visual, Vocal', '1992-12-04', 'Korean', 12000),
('j-hope', '제이홉', 'j-hope', (SELECT id FROM public.groups WHERE slug='bts'), 'Main Dancer, Sub Rapper', '1994-02-18', 'Korean', 11500),

-- BLACKPINK members
('Lisa', '리사', 'lisa', (SELECT id FROM public.groups WHERE slug='blackpink'), 'Main Dancer, Lead Rapper', '1997-03-27', 'Thai', 14000),
('Jennie', '제니', 'jennie', (SELECT id FROM public.groups WHERE slug='blackpink'), 'Main Rapper, Vocal', '1996-01-16', 'Korean', 13500),
('Jisoo', '지수', 'jisoo', (SELECT id FROM public.groups WHERE slug='blackpink'), 'Visual, Vocal', '1995-01-03', 'Korean', 12000),
('Rosé', '로제', 'rose', (SELECT id FROM public.groups WHERE slug='blackpink'), 'Main Vocal, Lead Dancer', '1997-02-11', 'Korean-Australian', 12500),

-- Stray Kids members
('Felix', '필릭스', 'felix', (SELECT id FROM public.groups WHERE slug='stray-kids'), 'Dance, Vocal, Rap', '2000-09-15', 'Korean-Australian', 11000),
('Hyunjin', '현진', 'hyunjin', (SELECT id FROM public.groups WHERE slug='stray-kids'), 'Main Dancer, Visual', '2000-03-20', 'Korean', 10500),
('Bang Chan', '방찬', 'bang-chan', (SELECT id FROM public.groups WHERE slug='stray-kids'), 'Leader, Producer', '1997-10-03', 'Korean-Australian', 10000),
('Han', '한', 'han', (SELECT id FROM public.groups WHERE slug='stray-kids'), 'Main Rapper, Producer', '2000-09-14', 'Korean', 9800),
('Lee Know', '리노', 'lee-know', (SELECT id FROM public.groups WHERE slug='stray-kids'), 'Main Dancer', '1998-10-25', 'Korean', 9500),
('Changbin', '창빈', 'changbin', (SELECT id FROM public.groups WHERE slug='stray-kids'), 'Main Rapper, Producer', '1999-08-11', 'Korean', 9000),
('Seungmin', '승민', 'seungmin', (SELECT id FROM public.groups WHERE slug='stray-kids'), 'Main Vocal', '2000-09-22', 'Korean', 8800),
('I.N', '아이엔', 'i-n', (SELECT id FROM public.groups WHERE slug='stray-kids'), 'Vocal, Maknae', '2001-02-08', 'Korean', 8500),

-- aespa members
('Karina', '카리나', 'karina', (SELECT id FROM public.groups WHERE slug='aespa'), 'Leader, Main Dancer, Vocal', '2000-04-11', 'Korean', 11000),
('Winter', '윈터', 'winter', (SELECT id FROM public.groups WHERE slug='aespa'), 'Main Vocal, Lead Dancer', '2001-01-01', 'Korean', 10500),
('Giselle', '지젤', 'giselle', (SELECT id FROM public.groups WHERE slug='aespa'), 'Main Rapper', '2000-10-30', 'Korean-Japanese', 9500),
('NingNing', '닝닝', 'ningning', (SELECT id FROM public.groups WHERE slug='aespa'), 'Main Vocal', '2002-10-23', 'Chinese', 9000),

-- NewJeans members
('Minji', '민지', 'minji', (SELECT id FROM public.groups WHERE slug='newjeans'), 'Vocal, Dance', '2004-05-07', 'Korean', 10500),
('Hanni', '하니', 'hanni', (SELECT id FROM public.groups WHERE slug='newjeans'), 'Vocal', '2004-10-06', 'Vietnamese-Australian', 10800),
('Danielle', '다니엘', 'danielle', (SELECT id FROM public.groups WHERE slug='newjeans'), 'Vocal, Dance', '2005-04-11', 'Korean-Australian', 10000),
('Haerin', '해린', 'haerin', (SELECT id FROM public.groups WHERE slug='newjeans'), 'Vocal', '2006-05-15', 'Korean', 9800),
('Hyein', '혜인', 'hyein', (SELECT id FROM public.groups WHERE slug='newjeans'), 'Vocal, Maknae', '2008-04-21', 'Korean', 9000),

-- SEVENTEEN members (top 5 by popularity)
('Mingyu', '민규', 'mingyu', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Visual, Sub Vocal', '1997-04-06', 'Korean', 10000),
('Wonwoo', '원우', 'wonwoo', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Lead Rapper', '1996-07-17', 'Korean', 9500),
('Jeonghan', '정한', 'jeonghan', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Sub Vocal', '1995-10-04', 'Korean', 9200),
('S.Coups', '에스쿱스', 's-coups', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Leader, Main Rapper', '1995-08-08', 'Korean', 9000),
('Hoshi', '호시', 'hoshi', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Performance Leader', '1996-06-15', 'Korean', 8800),
('Vernon', '버논', 'vernon', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Lead Rapper', '1998-02-18', 'Korean-American', 8500),
('Woozi', '우지', 'woozi', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Vocal Leader, Producer', '1996-11-22', 'Korean', 8500),
('DK', '도겸', 'dk-svt', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Main Vocal', '1997-02-18', 'Korean', 8000),
('Joshua', '조슈아', 'joshua', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Sub Vocal', '1995-12-30', 'Korean-American', 8000),
('Jun', '준', 'jun-svt', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Lead Dancer', '1996-06-10', 'Chinese', 7800),
('The8', '디에잇', 'the8', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Lead Dancer', '1997-11-07', 'Chinese', 7500),
('Seungkwan', '승관', 'seungkwan', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Main Vocal', '1998-01-16', 'Korean', 7800),
('Dino', '디노', 'dino', (SELECT id FROM public.groups WHERE slug='seventeen'), 'Main Dancer, Maknae', '1999-02-11', 'Korean', 7300),

-- ENHYPEN members
('Sunghoon', '성훈', 'sunghoon', (SELECT id FROM public.groups WHERE slug='enhypen'), 'Visual, Dance', '2002-12-08', 'Korean', 9000),
('Heeseung', '희승', 'heeseung', (SELECT id FROM public.groups WHERE slug='enhypen'), 'Main Vocal, Dance', '2001-10-15', 'Korean', 8800),
('Jake', '제이크', 'jake-enhypen', (SELECT id FROM public.groups WHERE slug='enhypen'), 'Vocal, Dance', '2002-11-15', 'Korean-Australian', 8700),
('Jay', '제이', 'jay-enhypen', (SELECT id FROM public.groups WHERE slug='enhypen'), 'Vocal, Dance', '2002-04-20', 'Korean-American', 8300),
('Jungwon', '정원', 'jungwon', (SELECT id FROM public.groups WHERE slug='enhypen'), 'Leader, Vocal', '2004-02-09', 'Korean', 8500),
('Sunoo', '선우', 'sunoo', (SELECT id FROM public.groups WHERE slug='enhypen'), 'Vocal', '2003-06-24', 'Korean', 8200),
('Ni-ki', '니키', 'ni-ki', (SELECT id FROM public.groups WHERE slug='enhypen'), 'Main Dancer, Maknae', '2005-12-09', 'Japanese', 8000),

-- TXT members
('Yeonjun', '연준', 'yeonjun', (SELECT id FROM public.groups WHERE slug='txt'), 'Dance, Rap', '1999-09-13', 'Korean', 9200),
('Soobin', '수빈', 'soobin', (SELECT id FROM public.groups WHERE slug='txt'), 'Leader, Vocal', '2000-12-05', 'Korean', 8800),
('Beomgyu', '범규', 'beomgyu', (SELECT id FROM public.groups WHERE slug='txt'), 'Vocal, Guitar', '2001-03-13', 'Korean', 8500),
('Taehyun', '태현', 'taehyun-txt', (SELECT id FROM public.groups WHERE slug='txt'), 'Main Vocal', '2002-02-05', 'Korean', 8200),
('Huening Kai', '휴닝카이', 'huening-kai', (SELECT id FROM public.groups WHERE slug='txt'), 'Vocal, Maknae', '2002-08-14', 'Korean-American', 8000),

-- IVE members
('Wonyoung', '원영', 'wonyoung', (SELECT id FROM public.groups WHERE slug='ive'), 'Visual, Center', '2004-08-31', 'Korean', 10500),
('Yujin', '유진', 'yujin-ive', (SELECT id FROM public.groups WHERE slug='ive'), 'Leader, Vocal', '2003-09-01', 'Korean', 9000),
('Gaeul', '가을', 'gaeul', (SELECT id FROM public.groups WHERE slug='ive'), 'Dance, Vocal', '2002-09-24', 'Korean', 7500),
('Rei', '레이', 'rei', (SELECT id FROM public.groups WHERE slug='ive'), 'Vocal, Rap', '2004-02-03', 'Japanese', 7800),
('Liz', '리즈', 'liz-ive', (SELECT id FROM public.groups WHERE slug='ive'), 'Main Vocal', '2004-11-21', 'Korean', 7500),
('Leeseo', '이서', 'leeseo', (SELECT id FROM public.groups WHERE slug='ive'), 'Vocal, Maknae', '2007-02-21', 'Korean', 7200),

-- LE SSERAFIM members
('Kazuha', '카즈하', 'kazuha', (SELECT id FROM public.groups WHERE slug='le-sserafim'), 'Dance, Vocal', '2003-08-09', 'Japanese', 8500),
('Sakura', '사쿠라', 'sakura', (SELECT id FROM public.groups WHERE slug='le-sserafim'), 'Vocal', '1998-03-19', 'Japanese', 8300),
('Chaewon', '채원', 'chaewon-lsf', (SELECT id FROM public.groups WHERE slug='le-sserafim'), 'Leader, Vocal', '2000-08-01', 'Korean', 8000),
('Yunjin', '윤진', 'yunjin', (SELECT id FROM public.groups WHERE slug='le-sserafim'), 'Main Vocal', '2001-10-08', 'Korean-American', 7800),
('Eunchae', '은채', 'eunchae', (SELECT id FROM public.groups WHERE slug='le-sserafim'), 'Maknae, Vocal', '2006-11-10', 'Korean', 7200),

-- (G)I-DLE members
('Miyeon', '미연', 'miyeon', (SELECT id FROM public.groups WHERE slug='g-i-dle'), 'Main Vocal, Visual', '1997-01-31', 'Korean', 7500),
('Minnie', '민니', 'minnie', (SELECT id FROM public.groups WHERE slug='g-i-dle'), 'Main Vocal', '1997-10-23', 'Thai', 7800),
('Soyeon', '소연', 'soyeon', (SELECT id FROM public.groups WHERE slug='g-i-dle'), 'Leader, Main Rapper, Producer', '1998-08-26', 'Korean', 8000),
('Yuqi', '우기', 'yuqi', (SELECT id FROM public.groups WHERE slug='g-i-dle'), 'Vocal', '1999-09-23', 'Chinese', 7800),
('Shuhua', '슈화', 'shuhua', (SELECT id FROM public.groups WHERE slug='g-i-dle'), 'Vocal, Visual', '2000-01-06', 'Taiwanese', 7000),

-- TWICE top members
('Tzuyu', '쯔위', 'tzuyu', (SELECT id FROM public.groups WHERE slug='twice'), 'Visual, Vocal', '1999-06-14', 'Taiwanese', 9000),
('Sana', '사나', 'sana', (SELECT id FROM public.groups WHERE slug='twice'), 'Vocal', '1996-12-29', 'Japanese', 8800),
('Momo', '모모', 'momo', (SELECT id FROM public.groups WHERE slug='twice'), 'Main Dancer', '1996-11-09', 'Japanese', 8500),
('Nayeon', '나연', 'nayeon', (SELECT id FROM public.groups WHERE slug='twice'), 'Main Vocal, Center', '1995-09-22', 'Korean', 9200),
('Dahyun', '다현', 'dahyun', (SELECT id FROM public.groups WHERE slug='twice'), 'Lead Rapper', '1998-05-28', 'Korean', 8200),
('Mina', '미나', 'mina-twice', (SELECT id FROM public.groups WHERE slug='twice'), 'Main Dancer', '1997-03-24', 'Japanese-American', 8300),
('Jeongyeon', '정연', 'jeongyeon', (SELECT id FROM public.groups WHERE slug='twice'), 'Lead Vocal', '1996-11-01', 'Korean', 7800),
('Jihyo', '지효', 'jihyo', (SELECT id FROM public.groups WHERE slug='twice'), 'Leader, Main Vocal', '1997-02-01', 'Korean', 8000),
('Chaeyoung', '채영', 'chaeyoung-twice', (SELECT id FROM public.groups WHERE slug='twice'), 'Main Rapper', '1999-04-23', 'Korean', 7500);
