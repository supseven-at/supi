
CREATE TABLE tt_content (
    tx_supi_youtube_ids varchar(255) NOT NULL DEFAULT '',
    tx_supi_youtube_urls varchar(255) NOT NULL DEFAULT ''
);

CREATE TABLE sys_file_reference (
    tx_supi_video_cover int(11) unsigned DEFAULT '0' NOT NULL
);
