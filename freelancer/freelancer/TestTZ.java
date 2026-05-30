import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

public class TestTZ {
    public static void main(String[] args) {
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        
        String createDate = formatter.format(calendar.getTime());
        System.out.println("createDate: " + createDate);
        
        calendar.add(Calendar.MINUTE, 15);
        String expireDate = formatter.format(calendar.getTime());
        System.out.println("expireDate: " + expireDate);
    }
}
