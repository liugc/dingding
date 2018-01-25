--
-- 表的结构 `dingding`
--

CREATE TABLE `dingding` (
  `id` int(11) NOT NULL,
  `webhook` varchar(256) NOT NULL,
  `content` varchar(256) NOT NULL,
  `time` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dingding`
--
ALTER TABLE `dingding`
  ADD PRIMARY KEY (`id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `dingding`
--
ALTER TABLE `dingding`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;