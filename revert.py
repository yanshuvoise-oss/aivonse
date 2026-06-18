import os
import glob

def revert_auth_pages():
    for f in glob.glob("src/app/(auth)/*/page.tsx"):
        with open(f, "r") as file:
            content = file.read()
        content = content.replace("text-base md:text-sm", "text-sm")
        content = content.replace("py-3 md:py-2.5", "py-2.5")
        with open(f, "w") as file:
            file.write(content)

def revert_dashboard_profile():
    f = "src/app/dashboard/profile/page.tsx"
    with open(f, "r") as file:
        content = file.read()
    content = content.replace("text-base md:text-sm", "text-sm")
    content = content.replace("py-2.5 sm:py-3", "py-3")
    content = content.replace("px-4 sm:px-3", "px-3")
    content = content.replace("pl-4 pr-3 py-2 sm:py-3 text-sm text-zinc-500 bg-zinc-100 sm:border-r border-b sm:border-b-0 border-zinc-200", "pl-4 pr-1 py-3 text-sm text-zinc-500 bg-zinc-100 border-r border-zinc-200")
    content = content.replace("flex flex-col sm:flex-row sm:items-center", "flex items-center")
    # There was also `flex flex-col sm:flex-row gap-4` if applicable
    with open(f, "w") as file:
        file.write(content)

def revert_dashboard_lists():
    for f in ["src/app/dashboard/links/page.tsx", "src/app/dashboard/images/page.tsx", "src/app/dashboard/pdfs/page.tsx", "src/app/dashboard/documents/page.tsx"]:
        with open(f, "r") as file:
            content = file.read()
        
        # In the main div
        old_div = 'group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border bg-white hover:border-zinc-300 p-4 lg:p-5 transition-all duration-300 cursor-pointer shadow-sm gap-4'
        new_div = 'group flex items-center justify-between rounded-2xl border bg-white hover:border-zinc-300 p-4 lg:p-5 transition-all duration-300 cursor-pointer shadow-sm'
        content = content.replace(old_div, new_div)
        
        old_inner = 'flex items-center gap-4 min-w-0 w-full sm:w-auto'
        new_inner = 'flex items-center gap-4 min-w-0'
        content = content.replace(old_inner, new_inner)
        
        with open(f, "w") as file:
            file.write(content)

def revert_analytics():
    f = "src/app/dashboard/analytics/page.tsx"
    with open(f, "r") as file:
        content = file.read()
    old_code = """        <div className="flex justify-between mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          {metrics.dailyTrend.map((t, idx) => {
            const isMilestone = idx === 0 || idx === Math.floor(metrics.dailyTrend.length / 2) || idx === metrics.dailyTrend.length - 1;
            return (
              <span key={idx} className={isMilestone ? "inline" : "hidden sm:inline"}>
                {t.date}
              </span>
            );
          })}
        </div>"""
    new_code = """        <div className="flex justify-between mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          {metrics.dailyTrend.map((t, idx) => (
            <span key={idx}>{t.date}</span>
          ))}
        </div>"""
    content = content.replace(old_code, new_code)
    with open(f, "w") as file:
        file.write(content)

def revert_page():
    f = "src/app/page.tsx"
    with open(f, "r") as file:
        content = file.read()
    old_h1 = '<h1 className="text-4xl sm:text-7xl lg:text-[80px] font-extrabold tracking-tight text-zinc-900 leading-[1.1]">'
    new_h1 = '<h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl lg:text-[80px] leading-[1.1]">'
    content = content.replace(old_h1, new_h1)
    with open(f, "w") as file:
        file.write(content)

revert_auth_pages()
revert_dashboard_profile()
revert_dashboard_lists()
revert_analytics()
revert_page()
print("Reverted all successfully.")
