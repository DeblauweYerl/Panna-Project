from Database import Database

class DataRepository:
    @staticmethod
    def json_or_formdata(request):
        if request.content_type == 'application/json':
            gegevens = request.get_json()
        else:
            gegevens = request.form.to_dict()
        return gegevens


    @staticmethod
    def read_scoreboard_easy():
        sql = "SELECT DISTINCT PlayerName, Time FROM tblGame WHERE Difficulty = 0 ORDER BY Time DESC"
        return Database.get_rows(sql)

    @staticmethod
    def read_scoreboard_normal():
        sql = "SELECT DISTINCT PlayerName, Time FROM tblGame WHERE Difficulty = 1 ORDER BY Time DESC"
        return Database.get_rows(sql)

    @staticmethod
    def read_scoreboard_hard():
        sql = "SELECT DISTINCT PlayerName, Time FROM tblGame WHERE Difficulty = 2 ORDER BY Time DESC"
        return Database.get_rows(sql)


    @staticmethod
    def insert_game(timestamp, player_name, difficulty, time):
        sql = "INSERT INTO tblGame VALUES (%s,%s,%s,%s)"
        params = [timestamp, player_name, difficulty, time]
        return Database.execute_sql(sql, params)