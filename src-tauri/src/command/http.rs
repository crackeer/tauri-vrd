
use crate::util::file;
use scraper::{Html, Selector};
use tauri;

#[tauri::command]
pub async fn parse_js_code(url: String) -> Vec<String> {
    let mut list : Vec<String> = Vec::new();
    let result = file::download_text(&url).await;
    if let Err(_err) = result {
        return list
    }
    let html = result.unwrap();
   
    let document = Html::parse_document(&html);
    let script_selector = Selector::parse("script").unwrap();

    for script in document.select(&script_selector) {
        let script_content = script.inner_html();
        list.push(script_content);
    }
    list
}

#[tauri::command]
pub async fn parse_html_title(url: String) -> String {
    let result = file::download_text(&url).await;
    if let Err(_err) = result {
        return String::from("");
    }
    let html = result.unwrap();
   
    let document = Html::parse_document(&html);
    let script_selector = Selector::parse("title").unwrap();

    for script in document.select(&script_selector) {
        return  script.inner_html();
    }
    String::from("")
}